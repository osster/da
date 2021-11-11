import { Injectable, Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Option, OptionType } from "../../../models/options.entity";
import { Section } from "../../../models/sections.entity";
import { Group } from "../../../models/groups.entity";
import { Site } from "../../../models/site.entity";
import { Connection, getConnection, getConnectionManager, QueryRunner, Repository } from "typeorm";
import { ParsedRepository } from "../../helpers/db.helpers";
import { raw } from "express";
import { BullModule, InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { configService } from "../../../../config/config.service";

const crypto = require('crypto');

@Injectable()
export class DbManageOnlinerCatalogItems {
    private connection: Connection;
    private queryRunner: QueryRunner;

    constructor (
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        // @InjectRepository(Group)
        // private readonly groupRepo: Repository<Group>,
        // @InjectRepository(Option)
        // private readonly optionRepo: Repository<Option>,
        // @InjectQueue('queueDbManage')
        // private readonly queueDbManage: Queue,
    ) {
        this.connection = getConnection();
        this.queryRunner = this.connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public async run(sectionId: string, itemId: string, index: number, total: number) {
        const tmpTableName = `t_${crypto.createHash('md5').update(`${sectionId}`).digest('hex')}`;
        const query = `
            SELECT * FROM ${tmpTableName}
            WHERE id = '${itemId}';
        `;
        const item = await this.queryRunner.query(query);
        const section = await this.sectionRepo.findOne({
            where: {
                id: sectionId
            },
            relations: ['site', 'groups', 'groups.options']
        });
        if (item.length && item[0].raw !== null) {
            const dataRow = await this.prepareRow(section, item[0]);
            this.storeRow(sectionId, dataRow, index, total)
        }
    }

    private async prepareRow(section: Section, item) {
        const dataRow = {
            name: item.name,
            description: item.description,
            item_id: item.item_id,
            item_key: item.item_key,
            url: item.url,
            images: `{${item.images}}` || '{}',
        };
        for (const group of section.groups) {
            for (const option of group.options) {
                const colKey = `p_${crypto.createHash('md5').update(`${group.id + option.id}`).digest('hex')}`;
                dataRow[colKey] = '';
                if (item.raw && item.raw.options) {
                    const jOption = item.raw.options.find((o) => {
                        return o.label === option.name && o.group === group.name;
                    });
                    if (jOption) {
                        dataRow[colKey] = (jOption.text !== '' ? jOption.text : null) || (jOption.is_checked !== null ? jOption.is_checked : null);
                    }
                }
            }
        }
        return dataRow;
    }

    async storeRow(sectionId: string, row, index, total) {
        // Logger.debug(`DbManageOnlinerCatalogItems ${row.name} ${index} of ${total} (pid ${process.pid})`, `job_dbmanage`);
        try {
            const rawTableName = `r_${crypto.createHash('md5').update(`${sectionId}`).digest('hex')}`;
            const itemQuery = `
                SELECT * FROM ${rawTableName}
                WHERE item_id = '${row.item_id}' AND item_key = '${row.item_key}';
            `;
            const item = await this.queryRunner.query(itemQuery);
            let query = '';
            if (item.length > 0) {
                const columns = Object.keys(row).map((k) => {
                    return `"${k}"='${row[k]}'`;
                }).join(', ');
                query = `
                    UPDATE "${rawTableName}" SET ${columns} WHERE "item_id" = '${row.item_id}' AND "item_key" = '${row.item_key};';
                `;
            } else {
                const columns = `"${ Object.keys(row).join('", "') }"`;
                const values = `'${ Object.values(row).join(`', '`) }'`;
                query = `
                    INSERT INTO "${rawTableName}" (${columns}) VALUES (${values});
                `;
            }
            const res = await this.queryRunner.query(query);
            return res;
        } catch (e) {
            console.log(row)
            console.error(e)
        }
    }
};

@Module({
    imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([
            Site,
            Section,
            Group,
            Option,
        ]),
        BullModule.registerQueueAsync({
            name: 'queueDbManage',
            useFactory: async () => ({
                name: 'queueDbManage',
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
        DbManageOnlinerCatalogItems,
    ],
    exports: [
        DbManageOnlinerCatalogItems,
    ]
})
export class DbManageOnlinerCatalogItemsModule {}