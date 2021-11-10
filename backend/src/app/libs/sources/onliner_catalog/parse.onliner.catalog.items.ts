import { Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Section } from "../../../models/sections.entity";
import { Site } from "../../../models/site.entity";

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export interface ParsedOnlinerCatalogItem {
    item_id: string,
    item_key: string,
    name: string,
    images: string[],
    description: string,
    url: string,
};

export class ParseOnlinerCatalogItems {
    private tableName: string;
    private connection: Connection;
    private queryRunner: QueryRunner;

    constructor(
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {
        this.connection = getConnection();
        this.queryRunner = this.connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public run(siteId: string, sectionId: string, filePath: string, page: number) {
        let baseDir = path.join(filePath);
        let data = fs.readFileSync(baseDir);
        const json = JSON.parse(data);
        const items = [];
    
        if (json && json.products) {
            try {
                Object.keys(json.products)
                    .forEach((k) => {
                        const p = json.products[k];
                        if (p) {
                            items.push({
                                item_id: p.id,
                                item_key: p.key,
                                name: p.name,
                                images: p.images && p.images.header ? [p.images.header] : [],
                                description: p.description,
                                url: p.html_url,
                            });
                        } else {
                            Logger.error(`Product ${k} not found.`, 'job_parse');
                            console.log('json', json);
                        }
                    });
            } catch (e) {
                Logger.error('Parsing Onliner catalog items fails.', 'job_parse');
                console.error(e);
            }
        } else {
            Logger.error(`Parsing Onliner catalog items JSON not found.`, 'job_parse');
        }
        
        //fs.unlinkSync(baseDir);
    
        return {
            siteId,
            sectionId,
            filePath,
            page,
            items, 
        };
    }

    public async store(siteId, sectionId, items) {
        try {
            const section = await this.sectionRepo.findOne({
                where: { id: sectionId },
                relations: ['site'],
            });
            this.tableName = `t_${crypto.createHash('md5').update(`${section.id}`).digest('hex')}`;
            items.forEach(async (i) => {
                const row = await this.isRecordExists(this.tableName, i.item_id, i.item_key);
                if (!row) {
                    // insert
                    await this.createRecord(this.tableName, i);
                } 
                // else {
                //     // update
                //     const dirty = this.getDirty(row, i);
                //     if (Object.keys(dirty.values).length > 0) {
                //         await this.updateRecord(this.tableName, row.id, dirty); 
                //     }
                // }
            });
        } catch (e) {
            Logger.error('DbManageOnlinerCatalogItems fails', 'job_dbmanage_items');
            console.log(e);
        }
    }

    public removeCachedData(filePath: string) {        
        const fs = require('fs');
        fs.unlinkSync(filePath);
    }

    private async isRecordExists(tableName: string, id: string, key: string) {
        const row = await this.queryRunner.query(`
            SELECT *
            FROM ${tableName}
            WHERE item_id = '${id}' AND item_key = '${key}';
          `);
        return row.length > 0 ? row[0] : false;
    }

    private static prepareDbArray(value: string[]) {
        return `{${value.length ? `"${value.join(`", "`)}"` : ''}}`;
    }

    private async createRecord(tableName: string, row: ParsedOnlinerCatalogItem) {
        const columnsQuery = {
            item_id: `'${row.item_id}'`,
            item_key: `'${row.item_key}'`,
            url: `'${row.url}'`,
            name: `'${row.name}'`,
            images: `'${ParseOnlinerCatalogItems.prepareDbArray(row.images)}'`,
            description: `'${row.description}'`,
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

    private async updateRecord(tableName: string, id: string, dirty: {query: string, values: string[]}) {
        const queryStr = `
            UPDATE "${tableName}" SET
                ${dirty.query},
                updated_at = now()
            WHERE
                id = '${id}';
        `;
        await this.queryRunner.query(queryStr, dirty.values);
    }

    private getDirty(old, item: ParsedOnlinerCatalogItem): {query: string, values: string[]} {
        const columns = [
            "item_id",
            "item_key",
            "url",
            "name",
            "images",
            "description",
        ];
        const query = [];
        const values = [];
        columns.forEach((c, i) => {
            let ovc, nvc, nv, ov;
            if (c === 'images') {
                ovc = JSON.stringify(old[c]);
                nvc = JSON.stringify(item[c]);
                ov = `${old[c]}`;
                nv = ParseOnlinerCatalogItems.prepareDbArray(item[c]);
            } else {
                ov = ovc = `${old[c]}`;
                nv = nvc = `${item[c]}`;
            }
            if(ovc !== nvc) {
                query.push(`${c} = :${c}::text\n`);
                values.push(nv);
            }
        });
        return {
            query: query.join(','),
            values
        };
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
        ]),
    ],
    providers: [
        ParseOnlinerCatalogItems,
    ],
    exports: [
        ParseOnlinerCatalogItems,
    ]
})
export class ParseOnlinerCatalogItemsModule {}