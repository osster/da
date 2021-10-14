import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Section } from "../../../../models/sections.entity";
import { ParsedOnlinerCatalogItem } from "../../../parse/libs/parse.onliner.catalog.items";

const crypto = require('crypto');

class DbManageOnlinerCatalogItems {
    private tableName: string;
    private queryRunner: QueryRunner;

    constructor (
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) {
        const connection: Connection = getConnection();
        this.queryRunner = connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public async run(sectionId: string, items: ParsedOnlinerCatalogItem[]) {
        Logger.debug(`DbManageOnlinerCatalogItems run ${sectionId}, ${items.length}`, 'queue_db_manage');
        try {
            const section = await this.sectionRepository.findOne({
                where: { id: sectionId },
                relations: ['site'],
            });
            Logger.debug(`DbManageOnlinerCatalogItems run ${section.id}`, 'queue_db_manage');
            this.tableName = `t_${crypto.createHash('md5').update(`${section.site.id}_${section.id}`).digest('hex')}`;
            Logger.debug(`DbManageOnlinerCatalogItems info ${this.tableName}`, 'queue_db_manage');
            items.forEach(async (i) => {
                Logger.debug(`DbManageOnlinerCatalogItems item ${i._id}`, 'queue_db_manage');
                const row = await this.isRecordExists(this.tableName, i._id);
                if (!row) {
                    // insert
                    await this.createRecord(this.tableName, i);
                } else {
                    // update
                    const dirty = this.getDirty(row, i);
                    if (Object.keys(dirty).length > 0) {
                        await this.updateRecord(this.tableName, row.id, dirty); 
                    }
                }
            });
        } catch (e) {
            Logger.error('DbManageOnlinerCatalogItems fails', 'queue_db_manage');
            console.log(e);
        }
    }

    private async isRecordExists(tableName: string, id: string) {
        const row = await this.queryRunner.query(`
            SELECT *
            FROM ${tableName}
            WHERE _id = '${id}';
          `);
        return row.length > 0 ? row[0] : false;
    }

    private static prepareDbArray(value: string[]) {
        return `{${value.length ? `"${value.join(`", "`)}"` : ''}}`;
    }

    private async createRecord(tableName: string, row: ParsedOnlinerCatalogItem) {
        const columnsQuery = {
            _id: `'${row._id}'`,
            key: `'${row.key}'`,
            url: `'${row.url}'`,
            html_url: `'${row.html_url}'`,
            name: `'${row.name}'`,
            full_name: `'${row.full_name}'`,
            name_prefix: `'${row.name_prefix}'`,
            images: `'${DbManageOnlinerCatalogItems.prepareDbArray(row.images)}'`,
            description: `'${row.description}'`,
            micro_description: `'${row.micro_description}'`,
        };
        const queryStr = `
            INSERT INTO "${tableName}" (
                ${Object.keys(columnsQuery).join(', ')}
            ) values (
                ${Object.values(columnsQuery).join(', ')}
            );
        `;
        await this.queryRunner.query(queryStr);
    }

    private async updateRecord(tableName: string, id: string, dirty: {[key: string]: string}) {
        const queryStr = `
            UPDATE "${tableName}" SET
                ${Object.values(dirty).join(', ')},
                updated_at = now()
            WHERE
                id = '${id}';
        `;
        await this.queryRunner.query(queryStr);
    }

    private getDirty(old, item: ParsedOnlinerCatalogItem): {[key: string]: string} {
        const columns = [
            "_id",
            "key",
            "url",
            "html_url",
            "name",
            "full_name",
            "name_prefix",
            "images",
            "description",
            "micro_description",
        ];
        const dirty = {};
        columns.forEach((c) => {
            let ovc, nvc, nv, ov;
            if (c === 'images') {
                ovc = JSON.stringify(old[c]);
                nvc = JSON.stringify(item[c]);
                ov = `${old[c]}`;
                nv = DbManageOnlinerCatalogItems.prepareDbArray(item[c]);
            } else {
                ov = ovc = `${old[c]}`;
                nv = nvc = `${item[c]}`;
            }
            if(ovc !== nvc) {
                dirty[c] = `${c} = '${nv}'`;
            }
        });
        return dirty;
    }
};

export default DbManageOnlinerCatalogItems;