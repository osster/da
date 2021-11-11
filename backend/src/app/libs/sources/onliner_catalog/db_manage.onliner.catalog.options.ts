import { Injectable, Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Option, OptionType } from "../../../models/options.entity";
import { Section } from "../../../models/sections.entity";
import { Group } from "../../../models/groups.entity";
import { Site } from "../../../models/site.entity";
import { ParsedRepository } from "../../helpers/db.helpers";

const crypto = require('crypto');

@Injectable()
export class DbManageOnlinerCatalogOptions {
    private groups: string[];
    private columns: string[][];
    private queryRunner: QueryRunner;

    constructor (
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        @InjectRepository(Group)
        private readonly groupRepo: Repository<Group>,
        @InjectRepository(Option)
        private readonly optionRepo: Repository<Option>,
    ) {
        const connection: Connection = getConnection();
        this.queryRunner = connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public async run(sectionId: string) {
        try {
            // Store Groups And Options to DB
            await this.storeGroupsAndOptions(sectionId);
            // Add or update raw data table 
            await this.addAndUpdateTableStruct(sectionId);
        } catch (e) {
            console.error(e)
        }
    }

    private async storeGroupsAndOptions(sectionId: string) {
        const tmpTableName = `t_${crypto.createHash('md5').update(`${sectionId}`).digest('hex')}`;
        const repo = new ParsedRepository(tmpTableName);
        const items = await repo.getAll();
        const groups = [];
        this.columns = [];

        // Collect unique groups
        for (const item of items) {
            if (item.raw && item.raw.options) {
                const parsed = item.raw.options.map(p => p.group);
                for (const group of parsed) {
                    if (!groups.includes(group)) {
                        groups.push(group);
                    }
                }
            }
        }
        
        // Collect unique options by groups
        groups.forEach((g, i) => {
            this.columns[i] = [];
        });
        for (const item of items) {
            if (item.raw && item.raw.options) {
                for (const option of item.raw.options) {
                    const groupIdx = groups.findIndex(g => g === option.group);
                    if (!this.columns[groupIdx].includes(option.label)) {
                        this.columns[groupIdx].push(option.label);
                    }
                }
            }
        }
        
        // Get section
        let section = await this.sectionRepo.findOne({
            where: {
                id: sectionId,
            },
            relations: ['site', 'groups']
        });

        // Add groups
        if (section && groups.length) {
            const site: Site = section.site;
            for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
                const groupName = groups[groupIdx];
                let group = await this.groupRepo.findOne({
                    where: {
                        site: site,
                        name: groupName,
                    },
                    relations: ['site']
                });
                if (!group) {
                    group = await this.groupRepo.save({
                        site: section.site,
                        name: groupName
                    });
                }
                try {
                    await getConnection()
                        .createQueryBuilder()
                        .relation(Section, "groups")
                        .of(section)
                        .add(group);
                } catch (e) {
                    // Error if exists...
                }
            }
        }

        // Add options
        if (section && this.columns.length) {
            const site: Site = section.site;

            for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
                const groupName = groups[groupIdx];
                const columns = this.columns[groupIdx];
                let group = await this.groupRepo.findOne({
                    where: {
                        site: site,
                        name: groupName,
                    },
                    relations: ['site']
                });
                for (const columnName of columns) {
                    if (columnName.length <= 120) {
                        let option = await this.optionRepo.findOne({
                            where: {
                                name: columnName
                            }
                        });
                        if (!option) {
                            const parameterId = `t_${crypto.createHash('md5').update(`${columnName}`).digest('hex')}`;
                            option = await this.optionRepo.save({
                                name: columnName,
                                description: '',
                                type: OptionType.STRING,
                                parameter_id: parameterId,
                            });
                        }
                        try {
                            await getConnection()
                                .createQueryBuilder()
                                .relation(Group, "options")
                                .of(group)
                                .add(option);
                        } catch (e) {
                            // Error if exists...
                        }
                    }
                }
            }
        }
    }

    private async addAndUpdateTableStruct(sectionId: string) {
        const rawTableName = `r_${crypto.createHash('md5').update(`${sectionId}`).digest('hex')}`;

        if (!await this.isTableExists(rawTableName)) {
            await this.createTable(rawTableName);
        }

        const {
            columns,
            colsListPrepared,
            columnsQuery
        } = await this.prepareColumns(sectionId);

        const dbColumns = await this.queryRunner.query(`
            SELECT
                column_name, data_type, udt_name, column_default, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = '${rawTableName}';
        `);
        // compare data types
        const dbColsPrepared = dbColumns.map(c => {
            const name = c.column_name;
            const isArray = c.data_type === 'ARRAY';
            const isBool = c.udt_name === 'bool';
            const isDayeTime = c.udt_name === 'timestamptz';
            const isString = c.udt_name === 'varchar';
            const isNum = c.udt_name === 'numeric' || c.udt_name === '_numeric';
            const isText = c.udt_name === 'text' || c.udt_name === '_text';
            const isUuid = c.udt_name === 'uuid' || c.udt_name === '_uuid';
            return {
                name,
                isArray,
                isString,
                isText,
                isNum,
                isBool,
                isDayeTime,
                isUuid,
            }
        });
        const dbColsDirty = colsListPrepared.filter(c => {
            const dbColPrepared = dbColsPrepared.find(cp => cp.name === c.name);
            return dbColPrepared && (
                dbColPrepared.isArray !== c.isArray ||
                dbColPrepared.isString !== c.isString ||
                dbColPrepared.isText !== c.isText ||
                dbColPrepared.isNum !== c.isNum ||
                dbColPrepared.isBool !== c.isBool ||
                dbColPrepared.isDayeTime !== c.isDayeTime ||
                dbColPrepared.isUuid !== c.isUuid
            );
        });
        const dbc = dbColumns.map(c => c.column_name);
        const newColumns = columns.filter(c => !dbc.includes(c));
        const addColumns = Object.keys(columnsQuery)
            .filter(k => newColumns.includes(k))
            .map(k => `ADD COLUMN  ${columnsQuery[k]}`);
        const updColumns = dbColsDirty.map(c => {
            let type = [];
            if (c.isBool) type.push('boolean');
            if (c.isUuid) type.push('UUID');
            if (c.isText) type.push('TEXT');
            if (c.isNum) type.push('NUMERIC');
            if (c.isString) type.push('VARCHAR');
            if (c.isDayeTime) type.push('timestamptz');
            if (c.isArray) type.push('ARRAY');
            return `ALTER COLUMN ${c.name} TYPE ${type.join(' ')}`;
        });
        if (addColumns.length || updColumns.length) {
            const alterSql = `ALTER TABLE ${rawTableName} ${addColumns.join(', ')} ${updColumns.join(', ')};`;
            // console.log({ alterSql });
            await this.queryRunner.query(alterSql);
        }
    }

    private async createTable(tableName: string) {
      const hash = crypto.createHash('md5').update(tableName).digest('hex');
      await this.queryRunner.query(`
        CREATE TABLE "${tableName}" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          "item_id" character varying(300) NOT NULL,
          "item_key" character varying(300) NOT NULL,
          "url" character varying(300) NOT NULL,
          "name" character varying(300) NOT NULL,
          "description" text NULL,
          "images" text ARRAY NULL,
          CONSTRAINT "PK_${hash}" PRIMARY KEY ("id")
        )
      `);
      await this.queryRunner.query(`CREATE INDEX "IDX_${tableName}_item_id" ON "${tableName}" ("item_id");`);
      await this.queryRunner.query(`CREATE INDEX "IDX_${tableName}_item_key" ON "${tableName}" ("item_key");`);
    }
    
    private async prepareColumns(sectionId: string) {
        const section: Section = await this.sectionRepo.findOne({
            where: {
                id: sectionId
            },
            relations: ['groups', 'groups.options']
        });
        const options: Option[] = [];
        const columns = [];
        const columnsQuery = {};
        const colsListPrepared = [];
        section.groups.forEach((group) => {
            group.options.forEach((o) => {
                options.push(o);
                const parameter_id = `p_${crypto.createHash('md5').update(`${group.id + o.id}`).digest('hex')}`;
                columns.push(parameter_id);
                const isArray = o.type === OptionType.DICTIONARY ||
                    o.type === OptionType.DICTIONARY_RANGE || 
                    o.type === OptionType.NUMBER_RANGE;
                const isString = o.type === OptionType.STRING;
                const isText = false;
                const isNum = o.type === OptionType.NUMBER_RANGE;
                const isBool = o.type === OptionType.BOOL;
                const isDayeTime = false;
                const isUuid = o.type === OptionType.DICTIONARY ||
                    o.type === OptionType.DICTIONARY_RANGE;
                colsListPrepared.push({
                    name: parameter_id,
                    isArray,
                    isString,
                    isText,
                    isNum,
                    isBool,
                    isDayeTime,
                    isUuid,
                });
            });
        });
        section.groups.forEach((group) => {
            group.options.forEach((option) => {
                const parameter_id = `p_${crypto.createHash('md5').update(`${group.id + option.id}`).digest('hex')}`;
                let dataType = '';
                switch (option.type) {
                    case OptionType.BOOL:
                        dataType = 'boolean';
                        break;
                    case OptionType.NUMBER_RANGE:
                        dataType = 'numeric ARRAY';
                        break;
                    case OptionType.DICTIONARY:
                        dataType = 'uuid ARRAY';
                        break;
                    case OptionType.DICTIONARY_RANGE:
                        dataType = 'uuid ARRAY';
                        break;
                    case OptionType.STRING:
                        dataType = 'TEXT'; // 'VARCHAR(300)';
                        break;
                }
                if (dataType != '') {
                    columnsQuery[parameter_id] = `"${parameter_id}" ${dataType} NULL`;
                }
            });
        });
        return {
            columns,
            colsListPrepared,
            columnsQuery
        }
    }

    private async isTableExists(tableName: string) {
        const tables = await this.queryRunner.query(`
            SELECT * FROM pg_catalog.pg_tables
            WHERE
            schemaname != 'pg_catalog' AND
            schemaname != 'information_schema' AND
            tablename = '${tableName}';
        `);
        return tables.length > 0;
    }
};

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
            Group,
            Option
        ]),
    ],
    providers: [
        DbManageOnlinerCatalogOptions,
    ],
    exports: [
        DbManageOnlinerCatalogOptions,
    ]
})
export class DbManageOnlinerCatalogOptionsModule {}