import { Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Connection, getConnection, In, QueryRunner, Repository } from "typeorm";
import { Dictionary } from "../../../models/dictionaries.entity";
import { Option, OptionType } from "../../../models/options.entity";
import { Section } from "../../../models/sections.entity";
import { Site } from "../../../models/site.entity";

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
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        @InjectRepository(Option)
        private readonly optionRepo: Repository<Option>,
        @InjectRepository(Dictionary)
        private readonly dictionaryRepo: Repository<Dictionary>,
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

        if (html.length) {
            try {
                const $ = cheerio.load(html);
                const elGallery = $('#product-gallery .product-gallery__thumbs .product-gallery__shaft');
                const elSpecs = $('.product-specs__table');
                elSpecs.find('tr:not(.product-specs__table-title)')
                    .each(function (i) {
                        const el = $(this);
                        el.find('td:first .product-tip-wrapper').remove();
                        const label = el.find('td:first').text().trim();
                        const txt = el.find('.value__text').text().trim();
                        const yes = el.find('.i-x').length > 0;
                        const no = el.find('.i-tip').length > 0;
                        const row = {
                            label,
                            text: txt,
                            is_checked: (yes || no) ? yes : null,
                        };
                        options.push(row);
                    });
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
                options = await this.prepareOptions(sectionId, itemId, options);
                const item = this.prepareRow(options/*.filter(i => !!i.optionId)*/);
                await this.store(sectionId, itemId, item);
                // console.log(
                //     // item.options.filter(i => !i.optionId),
                //     options.filter(i => !i.optionId).length,
                //     options.filter(i => !!i.optionId),
                //     this.prepareRow(options.filter(i => !!i.optionId)),
                // );
                fs.unlinkSync(filePath);
                // fs.writeFileSync(filePath, elGallery.html() + elSpecs.html(), { flag: "wx" });
            } catch (e) {
                Logger.error('Parsing Onliner catalog detail fails.', 'job_parse');
                console.error(e);
            }
        } else {
            Logger.error(`Parsing Onliner catalog detail HTML not found.`, 'job_parse');
        }

        //fs.unlinkSync(baseDir);

        return {
            siteId,
            sectionId,
            itemId,
            filePath,
        };
    }

    private async prepareOptions(sectionId: string, itemId: string, data: ParseOnlinerCatalogDetailOption[]) {
        const sectionObj = await this.sectionRepo.findOne({
            where: { id: sectionId },
            relations: [
                'groups',
                'groups.options',
                'groups.options.dictionary',
                'groups.options.dictionary.items'
            ],
        });
        const options: Option[] = [];
        if (sectionObj && sectionObj.groups && sectionObj.groups.length) {
            sectionObj.groups.forEach(group => {
                group.options.forEach(option => {
                    if (!options.find(o => o.id === option.id)) {
                        options.push(option);
                    }
                });
            });
        }

        data.map((row: ParseOnlinerCatalogDetailOption) => {
            const detectedOptions = options.filter(i => i.name === row.label);
            for (const option of detectedOptions) {
                if (
                    option.type === OptionType.DICTIONARY ||
                    option.type === OptionType.DICTIONARY_RANGE
                ) {
                    const items = row.text.split(',')
                        .map(i => {
                            if (option.dictionary) {
                                const dictionaryItemObj = option.dictionary.items.find(di => di.name === i.trim());
                                if (dictionaryItemObj) {
                                    Logger.debug(`${option.name} Dictionary ${option.dictionary.name}: ${dictionaryItemObj.name} object found`, 'store_detail');
                                    return dictionaryItemObj;
                                } else {
                                    console.log(option.dictionary.items.map(i => i.name));
                                    Logger.error(`${option.name} value for '${row.text}' not found in option ${option.type} ${option.id} for item ${itemId}`, 'store_detail');
                                }
                            } else {
                                Logger.error(`${option.name} value for '${row.text}' dictionary not associated`, 'store_detail');
                            }
                            return false;
                        })
                        .filter(i => !!i)
                        .map(i => i ? i.id : null);
                    // console.log({ items });
                    row.text = items.length
                        ? ParseOnlinerCatalogDetail.prepareDbArray(items)
                        : null;
                }
                else if (option.type === OptionType.NUMBER_RANGE) {
                    const items = row.text.split(',').map(i => `${parseFloat(i.trim())}`);
                    row.text = ParseOnlinerCatalogDetail.prepareDbArray(items);
                }
                else if (option.type === OptionType.BOOL) {
                    row.text = `${row.is_checked}`;
                }
                row.optionId = option.id;
                row.parametrId = option.parameter_id;
            }
            return row;
        });
        return data;
    }

    private prepareRow(data: ParseOnlinerCatalogDetailOption[]) {
        const row = {};
        for (const option of data.filter(i => !!i.optionId)) {
            row[option.parametrId] = option.text;
        }
        return row;
    }

    public async store(sectionId: string, itemId: string, item: any) {
        try {
            const section = await this.sectionRepo.findOne({
                where: { id: sectionId },
                relations: ['site'],
            });
            this.tableName = `t_${crypto.createHash('md5').update(`${section.site.id}_${section.id}`).digest('hex')}`;
            const old = await this.isRecordExists(this.tableName, itemId);
            if (old) {
                // update
                const dirty = this.getDirty(old, item);
                if (Object.keys(dirty).length > 0) {
                    await this.updateRecord(this.tableName, old.id, dirty);
                }
            }
        } catch (e) {
            Logger.error('ParseOnlinerCatalogDetail fails', 'job_parse_detail');
            console.log(e);
        }
    }

    public removeCachedData(filePath: string) {
        const fs = require('fs');
        fs.unlinkSync(filePath);
    }

    private async isRecordExists(tableName: string, id: string) {
        const row = await this.queryRunner.query(`
            SELECT *
            FROM ${tableName}
            WHERE id = '${id}';
          `);
        return row.length > 0 ? row[0] : false;
    }

    private static prepareDbArray(value: string[]) {
        return `{${value.length ? `"${value.join(`", "`)}"` : ''}}`;
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
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
            Option,
            Dictionary,
        ]),
    ],
    providers: [
        ParseOnlinerCatalogDetail,
    ],
    exports: [
        ParseOnlinerCatalogDetail,
    ]
})
export class ParseOnlinerCatalogDetailModule { }