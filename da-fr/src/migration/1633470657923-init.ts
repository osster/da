import {MigrationInterface, QueryRunner} from "typeorm";

export class init1633470657923 implements MigrationInterface {
    name = 'init1633470657923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "site" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" character varying(300) NOT NULL, "host" character varying(300) NOT NULL, CONSTRAINT "PK_635c0eeabda8862d5b0237b42b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" text, "type" "option_type_enum", "parameter_id" character varying(100) NOT NULL, "dictionary_id" character varying(100), "bool_type" character varying(100), "unit" character varying(20), "ratio" numeric(12,2), "operation" character varying(100), "enabled_in_segments" "option_enabled_in_segments_enum", "visible_in_segments" "option_visible_in_segments_enum", "siteId" uuid, CONSTRAINT "PK_e6090c1c6ad8962eea97abdbe63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dictionary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "key" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "siteId" uuid, CONSTRAINT "PK_d17df343bd5d01ed62dd0e55e4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "option" ADD CONSTRAINT "FK_614036867e88eb0578461a8e90c" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dictionary" ADD CONSTRAINT "FK_220f489a8615a7188f98f2161cc" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dictionary" DROP CONSTRAINT "FK_220f489a8615a7188f98f2161cc"`);
        await queryRunner.query(`ALTER TABLE "option" DROP CONSTRAINT "FK_614036867e88eb0578461a8e90c"`);
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`DROP TABLE "option"`);
        await queryRunner.query(`DROP TABLE "site"`);
    }

}
