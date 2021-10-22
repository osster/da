import { Injectable, Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Option, OptionType } from "../../../models/options.entity";
import { Section } from "../../../models/sections.entity";

const crypto = require('crypto');

@Injectable()
export class DbManageOnlinerCatalogOptions {
    private tableName: string;
    private columns: string[];
    private columnsQuery: {[key: string]: string};
    private colsListPrepared: {[key: string]: any};
    private queryRunner: QueryRunner;

    constructor (
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {
        const connection: Connection = getConnection();
        this.queryRunner = connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public async run(sectionId: string) {
        Logger.debug(`DbManageOnlinerCatalogOptions ${sectionId}`, 'db_manage_options');
        const sectionObj = await this.sectionRepo.findOne({
          where: { id: sectionId },
          relations: ['site', 'groups', 'groups.options'],
        });
        const options = [];
        if (sectionObj && sectionObj.groups && sectionObj.groups.length) {
            sectionObj.groups.forEach(group => {
                group.options.forEach(option => {
                    if (!options.find(o => o.id === option.id)) {
                        options.push(option);
                    }
                });
            });
        }
        this.prepareColumns(options);
        this.tableName = `t_${crypto.createHash('md5').update(`${sectionObj.site.id}_${sectionObj.id}`).digest('hex')}`;
        if (!await this.isTableExists(this.tableName)) {
            await this.createTable(this.tableName);
        } else {
            await this.updateTable(this.tableName);
        }
    }

    private prepareColumns(options: Option[]) {
        this.columns = [];
        this.columnsQuery = {};
        this.colsListPrepared = options.map(o => {
            const name = o.parameter_id;
            const isArray = o.type === OptionType.DICTIONARY ||
                o.type === OptionType.DICTIONARY_RANGE || 
                o.type === OptionType.NUMBER_RANGE;
            const isString = false;
            const isText = false;
            const isNum = o.type === OptionType.NUMBER_RANGE;
            const isBool = o.type === OptionType.BOOL;
            const isDayeTime = false;
            const isUuid = o.type === OptionType.DICTIONARY ||
              o.type === OptionType.DICTIONARY_RANGE;
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
        options.forEach((option: Option) => {
            this.columns.push(option.parameter_id); 
            let dataType = '';
            switch (option.type) {
                case 'boolean':
                    dataType = 'boolean';
                    break;
                case 'number_range':
                    dataType = 'numeric ARRAY';
                    break;
                case 'dictionary':
                    dataType = 'uuid ARRAY';
                    break;
                case 'dictionary_range':
                    dataType = 'uuid ARRAY';
                    break;
            }
            if (dataType != '') {
                this.columnsQuery[option.parameter_id] = `"${option.parameter_id}" ${dataType} NULL`;
            }
        });
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

    private async createTable(tableName: string) {
      const hash = crypto.createHash('md5').update(tableName).digest('hex');
      await this.queryRunner.query(`
        CREATE TABLE "${tableName}" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          "_id" character varying(300) NOT NULL,
          "key" character varying(300) NOT NULL,
          "url" character varying(300) NOT NULL,
          "html_url" character varying(300) NOT NULL,
          "name" character varying(300) NOT NULL,
          "full_name" character varying(300) NOT NULL,
          "name_prefix" character varying(300) NOT NULL,
          "images" text ARRAY NULL,
          "description" text NULL,
          "micro_description" text NULL,
          ${Object.values(this.columnsQuery).join(',')},
          CONSTRAINT "PK_${hash}" PRIMARY KEY ("id")
        )
      `);
      await this.queryRunner.query(`CREATE INDEX "IDX_${tableName}_key" ON "${tableName}" ("key");`);
    }

    private async updateTable(tableName: string) {
        const dbColumns = await this.queryRunner.query(`
            SELECT
                column_name, data_type, udt_name, column_default, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = '${tableName}';
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
        const dbColsDirty = this.colsListPrepared.filter(c => {
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
        const newColumns = this.columns.filter(c => !dbc.includes(c));
        const addColumns = Object.keys(this.columnsQuery)
            .filter(k => newColumns.includes(k))
            .map(k => `ADD COLUMN  ${this.columnsQuery[k]}`);
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
            const alterSql = `ALTER TABLE ${tableName} ${addColumns.join(', ')} ${updColumns.join(', ')};`;
            // console.log({ alterSql });
            await this.queryRunner.query(alterSql);
        }
    }
};

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Section,
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