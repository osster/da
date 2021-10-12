import {MigrationInterface, QueryRunner} from "typeorm";

export class init1634051205008 implements MigrationInterface {
    name = 'init1634051205008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "site_type_enum" AS ENUM('catalog_onliner_by', 'ab_onliner_by', 'r_onliner_by', 'olx_ua', 'dom_ria_com', 'auto_ria_com')`);
        await queryRunner.query(`CREATE TABLE "site" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" character varying(300) NOT NULL, "host" character varying(300) NOT NULL, "type" "site_type_enum", CONSTRAINT "PK_635c0eeabda8862d5b0237b42b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(100) NOT NULL, "uri" character varying(300) NOT NULL, "description" text, "siteId" uuid, CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "option_type_enum" AS ENUM('boolean', 'dictionary', 'number_range', 'dictionary_range')`);
        await queryRunner.query(`CREATE TYPE "option_enabled_in_segments_enum" AS ENUM('catalog', 'second')`);
        await queryRunner.query(`CREATE TYPE "option_visible_in_segments_enum" AS ENUM('catalog', 'second')`);
        await queryRunner.query(`CREATE TABLE "option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" text, "type" "option_type_enum", "parameter_id" character varying(100) NOT NULL, "dictionary_id" character varying(100), "bool_type" character varying(100), "unit" character varying(20), "ratio" numeric(12,2), "operation" character varying(100), "enabled_in_segments" "option_enabled_in_segments_enum", "visible_in_segments" "option_visible_in_segments_enum", "siteId" uuid, CONSTRAINT "PK_e6090c1c6ad8962eea97abdbe63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dictionary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "key" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "siteId" uuid, "optionId" uuid, CONSTRAINT "PK_d17df343bd5d01ed62dd0e55e4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "option_sections_section" ("optionId" uuid NOT NULL, "sectionId" uuid NOT NULL, CONSTRAINT "PK_dfa28e63174cd3a6619521d569c" PRIMARY KEY ("optionId", "sectionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_286dfaf66285fbd74914496e54" ON "option_sections_section" ("optionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2eddeedee5e69b2fdcf14fdabd" ON "option_sections_section" ("sectionId") `);
        await queryRunner.query(`ALTER TABLE "section" ADD CONSTRAINT "FK_a8ba9edaed6a810d26d8d898542" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "option" ADD CONSTRAINT "FK_614036867e88eb0578461a8e90c" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dictionary" ADD CONSTRAINT "FK_220f489a8615a7188f98f2161cc" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dictionary" ADD CONSTRAINT "FK_d14a6d0df71d3c09775e33ebacc" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "option_sections_section" ADD CONSTRAINT "FK_286dfaf66285fbd74914496e546" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "option_sections_section" ADD CONSTRAINT "FK_2eddeedee5e69b2fdcf14fdabd3" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "option_sections_section" DROP CONSTRAINT "FK_2eddeedee5e69b2fdcf14fdabd3"`);
        await queryRunner.query(`ALTER TABLE "option_sections_section" DROP CONSTRAINT "FK_286dfaf66285fbd74914496e546"`);
        await queryRunner.query(`ALTER TABLE "dictionary" DROP CONSTRAINT "FK_d14a6d0df71d3c09775e33ebacc"`);
        await queryRunner.query(`ALTER TABLE "dictionary" DROP CONSTRAINT "FK_220f489a8615a7188f98f2161cc"`);
        await queryRunner.query(`ALTER TABLE "option" DROP CONSTRAINT "FK_614036867e88eb0578461a8e90c"`);
        await queryRunner.query(`ALTER TABLE "section" DROP CONSTRAINT "FK_a8ba9edaed6a810d26d8d898542"`);
        await queryRunner.query(`DROP INDEX "IDX_2eddeedee5e69b2fdcf14fdabd"`);
        await queryRunner.query(`DROP INDEX "IDX_286dfaf66285fbd74914496e54"`);
        await queryRunner.query(`DROP TABLE "option_sections_section"`);
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`DROP TABLE "option"`);
        await queryRunner.query(`DROP TYPE "option_visible_in_segments_enum"`);
        await queryRunner.query(`DROP TYPE "option_enabled_in_segments_enum"`);
        await queryRunner.query(`DROP TYPE "option_type_enum"`);
        await queryRunner.query(`DROP TABLE "section"`);
        await queryRunner.query(`DROP TABLE "site"`);
        await queryRunner.query(`DROP TYPE "site_type_enum"`);
    }

}
