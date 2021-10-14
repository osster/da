import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, getConnection, QueryRunner, Repository } from "typeorm";
import { Option } from "../../../../models/options.entity";
import { Section } from "../../../../models/sections.entity";

const crypto = require('crypto');

@Injectable()
class DbManageOnlinerCatalogOptions {
    private tableName: string;
    private columns: string[];
    private columnsQuery: {[key: string]: string};
    private queryRunner: QueryRunner;

    constructor (
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) {
        const connection: Connection = getConnection();
        this.queryRunner = connection.createQueryRunner();
        this.queryRunner.connect();
    }

    public async run(sectionId: string) {
        const section = await this.sectionRepository.findOne({
          where: { id: sectionId },
          relations: ['site','options'],
        });
        this.prepareColumns(section.options);
        this.tableName = `t_${crypto.createHash('md5').update(`${section.site.id}_${section.id}`).digest('hex')}`;
        if (!await this.isTableExists(this.tableName)) {
            await this.createTable(this.tableName);
        } else {
            await this.updateTable(this.tableName);
        }
    }

    private prepareColumns(options: Option[]) {
        this.columns = [];
        this.columnsQuery = {};
        options.forEach((option: Option) => {
            this.columns.push(option.parameter_id); 
            let dataType = '';
            switch (option.type) {
                case 'boolean':
                    dataType = 'boolean';
                    break;
                case 'dictionary':
                    dataType = 'uuid';
                    break;
                case 'number_range':
                    dataType = 'numrange';
                    break;
                case 'dictionary_range':
                    dataType = 'text ARRAY';
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
                column_name, data_type, column_default, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = '${tableName}';
        `);
        const dbc = dbColumns.map(c => c.column_name);
        const newColumns = this.columns.filter(c => !dbc.includes(c));
        if (newColumns.length) {
            // TODO: ALTER TABLE...
            const newColumnsQuery = Object.keys(this.columnsQuery)
                .filter(k => newColumns.includes(k))
                .map(k => dbColumns[k]);
            console.log('ALTER TABLE', { tableName, newColumns, newColumnsQuery });
        }
    }
};

export default DbManageOnlinerCatalogOptions;