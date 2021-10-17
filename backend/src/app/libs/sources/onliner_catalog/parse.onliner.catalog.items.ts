import { Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Section } from "../../../models/sections.entity";
import { Site } from "../../../models/site.entity";

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export interface ParsedOnlinerCatalogItem {
    _id: string,
    key: string,
    name: string,
    full_name: string,
    name_prefix: string,
    images: string[],
    description: string,
    micro_description: string,
    html_url: string,
    url: string,
};

export class ParseOnlinerCatalogItems {
    private tableName: string;
    private queryRunner: QueryRunner;

    constructor(
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {
        const connection: Connection = getConnection();
        this.queryRunner = connection.createQueryRunner();
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
                                _id: p.id,
                                key: p.key,
                                name: p.name,
                                full_name: p.full_name,
                                name_prefix: p.name_prefix,
                                images: p.images && p.images.header ? [p.images.header] : [],
                                description: p.description,
                                micro_description: p.micro_description,
                                html_url: p.html_url,
                                url: p.url,
                            });
                        } else {
                            Logger.error(`Product ${k} not found.`, 'queue_parse');
                            console.log('json', json);
                        }
                    });
            } catch (e) {
                Logger.error('Parsing Onliner catalog items fails.', 'queue_parse');
                console.error(e);
            }
        } else {
            Logger.error(`Parsing Onliner catalog items JSON not found.`, 'queue_parse');
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
            Logger.debug(`DbManageOnlinerCatalogItems run ${section.id}`, 'queue_db_manage');
            this.tableName = `t_${crypto.createHash('md5').update(`${section.site.id}_${section.id}`).digest('hex')}`;
            Logger.debug(`DbManageOnlinerCatalogItems info ${this.tableName}`, 'queue_db_manage');
            items.forEach(async (i) => {
                // Logger.debug(`DbManageOnlinerCatalogItems item ${i._id}`, 'queue_db_manage');
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

    public removeCachedData(filePath: string) {        
        const fs = require('fs');
        fs.unlinkSync(filePath);
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
            images: `'${ParseOnlinerCatalogItems.prepareDbArray(row.images)}'`,
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
                nv = ParseOnlinerCatalogItems.prepareDbArray(item[c]);
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