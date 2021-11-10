import { BullModule, InjectQueue } from "@nestjs/bull";
import { Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Queue } from "bull";
import { configService } from "../../../../config/config.service";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Section } from "../../../models/sections.entity";

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');


export interface ParseOnlinerCatalogDetailArgs {
    siteId: string,
    sectionId: string,
    itemId: string,
    filePath: string,
    index: number,
    total: number,
};

export interface ParseOnlinerCatalogDetailOption {
    label: string,
    text: string,
    is_checked: boolean | null,
    optionId: string | null,
    parametrId: string | null,
}

export class ParseOnlinerCatalogDetail {
    private tableName: string;
    private queryRunner: QueryRunner;

    constructor(
        @InjectQueue('queueScrap')
        private readonly queueScrap: Queue,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {
        const connection: Connection = getConnection();
        this.queryRunner = connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public async run(siteId: string, sectionId: string, itemId: string, filePath: string, index: number, total: number) {
        Logger.verbose(`${index} ${total} ${filePath}`, 'job_parse_detail');
        let baseDir = path.join(filePath);
        let html = fs.readFileSync(baseDir);
        const gallery = [];
        let options = [];
        let variants = [];

        if (html.length) {
            try {
                const $ = cheerio.load(html);
                const elGallery = $('#product-gallery .product-gallery__thumbs .product-gallery__shaft');
                const elSpecs = $('.product-specs__table tbody');
                const name = $('.catalog-masthead__title').text().trim();
                const description = $('.offers-description__specs').text().trim();
                const preview = $('.offers-description__preview .offers-description__image').attr('src');
                
                // Item offers (variants)
                $('a.offers-description-filter-control')
                    .each(function () {
                        const el = $(this);
                        variants.push(el.attr('href'));
                    });
                // Groups and options
                elSpecs.each(function() {
                    const el = $(this);
                    const groupName = el.find('tr.product-specs__table-title .product-specs__table-title-inner').text().trim();
                    el.find('tr:not(.product-specs__table-title)')
                        .each(function () {
                            const el = $(this);
                            el.find('td:first .product-tip-wrapper').remove();
                            const label = el.find('td:first').text().trim();
                            const txt = el.find('.value__text').text().trim();
                            const yes = el.find('.i-x').length > 0;
                            const no = el.find('.i-tip').length > 0;
                            const row = {
                                group: groupName,
                                label,
                                text: txt,
                                is_checked: (yes || no) ? yes : null,
                            };
                            options.push(row);
                        });
                });
                // Item gallery
                elGallery.find('.product-gallery__thumb')
                    .each(function (i) {
                        const el = $(this);
                        if (el.attr('data-original')) {
                            const row = {
                                image: el.attr('data-original'),
                                thumb: el.find('img').attr('src'),
                            };
                            gallery.push(row);
                        }
                    });
                const jsonData = {
                    name,
                    description,
                    preview,
                    options,
                    gallery
                };
                await this.store(sectionId, itemId, jsonData);
                await this.addItemVariants(siteId, sectionId, itemId, variants);
                fs.unlinkSync(filePath);
            } catch (e) {
                Logger.error('Parsing Onliner catalog detail fails.', 'job_parse');
                console.error(e);
            }
        } else {
            Logger.error(`Parsing Onliner catalog detail HTML not found.`, 'job_parse');
        }

        return {
            siteId,
            sectionId,
            itemId,
            filePath,
        };
    }

    public async store(sectionId: string, itemId: string, item: any) {
        try {
            const section = await this.sectionRepo.findOne({
                where: { id: sectionId },
                relations: ['site'],
            });
            this.tableName = `t_${crypto.createHash('md5').update(`${section.id}`).digest('hex')}`;
            const old = await this.isRecordExists(this.tableName, itemId);
            if (old) {
                // update
                const dirty = this.getDirty(old, {
                    name: item.name,
                    description: item.description,
                    images: ParseOnlinerCatalogDetail.prepareDbArray([item.preview]),
                    raw: JSON.stringify(item)
                });
                if (Object.keys(dirty).length > 0) {
                    dirty['parsed_at'] = 'parsed_at = now()';
                    await this.updateRecord(this.tableName, old.id, dirty);
                } else {
                    await this.updateRecord(this.tableName, old.id, {});
                }
            }
            // if (old) {
            //     await this.updateRecord(this.tableName, itemId, { raw: item });
            // }
        } catch (e) {
            Logger.error('ParseOnlinerCatalogDetail fails', 'job_parse_detail');
            console.log(e);
        }
    }

    private async isRecordExists(tableName: string, id: string) {
        const row = await this.queryRunner.query(`
            SELECT *
            FROM ${tableName}
            WHERE id = '${id}';
          `);
        return row.length > 0 ? row[0] : false;
    }

    private async updateRecord(tableName: string, id: string, dirty: { [key: string]: string }) {
        const queryStr = `
            UPDATE "${tableName}" SET
                ${Object.values(dirty).join(', ')},
                updated_at = now()
            WHERE
                id = '${id}';
        `;
        await this.queryRunner.query(queryStr);
    }

    private getDirty(old, item): { [key: string]: string } {
        const columns = Object.keys(item);
        const dirty = {};
        columns.forEach((c) => {
            let ovc, nvc, nv, ov;
            ov = ovc = `${old[c]}`;
            nv = nvc = `${item[c]}`;
            if (ovc !== nvc) {
                dirty[c] = `${c} = '${nv}'`;
            }
        });
        return dirty;
    }

    private static prepareDbArray(value: string[]) {
        return `{${value.length ? `"${value.join(`", "`)}"` : ''}}`;
    }

    private async addItemVariants(siteId: string, sectionId: string, itemId: string, urls: string[]) {
        const tableName = `t_${crypto.createHash('md5').update(`${sectionId}`).digest('hex')}`;
        const queryStr = `
            SELECT * FROM "${tableName}"
            WHERE
                id = '${itemId}';
        `;
        const currentItem = await this.queryRunner.query(queryStr);
        for(const url of urls) {
            const queryStr = `
                SELECT COUNT(id) as ct FROM "${tableName}"
                WHERE
                    url = '${url}';
            `;
            const alreadyExists = await this.queryRunner.query(queryStr);
            if(parseInt(alreadyExists[0].ct) === 0) {
                const key = url.match(/\/([\w]*)$/);
                const queryStr = `
                    INSERT INTO "${tableName}" (
                        created_at,
                        updated_at,
                        item_id,
                        item_key,
                        url,
                        name,
                        description
                    ) VALUES (
                        now(),
                        now(),
                        '${currentItem[0]['item_id']}',
                        '${key[1]}',
                        '${url}',
                        '${currentItem[0]['name']}',
                        '${currentItem[0]['description']}'
                    ) RETURNING id;
                `;
                const newItem = await this.queryRunner.query(queryStr);
                const jobData = {
                    siteId,
                    sectionId,
                    itemId: newItem[0].id,
                    url,
                    index: 0,
                    total: 0,
                };
                this.queueScrap.add(
                    'jobScrapOnlinerCatalogDetail',
                    jobData
                );
            }
        }
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Section,
        ]),
        BullModule.registerQueueAsync({
            name: 'queueScrap',
            useFactory: async () => ({
                name: 'queueScrap',
                redis: configService.getRedisConfig(),
                prefix: 'da',
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: true,
                },
                settings: {
                    lockDuration: 300000,
                },
            })
        }),
    ],
    providers: [
        ParseOnlinerCatalogDetail,
    ],
    exports: [
        ParseOnlinerCatalogDetail,
    ]
})
export class ParseOnlinerCatalogDetailModule { }