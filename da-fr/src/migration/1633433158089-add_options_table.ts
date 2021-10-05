import {MigrationInterface, QueryRunner} from "typeorm";

export class addOptionsTable1633433158089 implements MigrationInterface {
    name = 'addOptionsTable1633433158089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "option_type_enum" AS ENUM('boolean', 'dictionary', 'number_range', 'dictionary_range')`);
        await queryRunner.query(`CREATE TYPE "option_enabled_in_segments_enum" AS ENUM('catalog', 'second')`);
        await queryRunner.query(`CREATE TYPE "option_visible_in_segments_enum" AS ENUM('catalog', 'second')`);
        await queryRunner.query(`CREATE TABLE "option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" text, "type" "option_type_enum", "parameter_id" character varying(100) NOT NULL, "dictionary_id" character varying(100) NOT NULL, "bool_type" character varying(100) NOT NULL, "unit" character varying(100) NOT NULL, "ratio" numeric(12,2) NOT NULL, "operation" character varying(100) NOT NULL, "enabled_in_segments" "option_enabled_in_segments_enum", "visible_in_segments" "option_visible_in_segments_enum", "siteId" uuid, CONSTRAINT "REL_614036867e88eb0578461a8e90" UNIQUE ("siteId"), CONSTRAINT "PK_e6090c1c6ad8962eea97abdbe63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "option" ADD CONSTRAINT "FK_614036867e88eb0578461a8e90c" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "option" DROP CONSTRAINT "FK_614036867e88eb0578461a8e90c"`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "option"`);
        await queryRunner.query(`DROP TYPE "option_visible_in_segments_enum"`);
        await queryRunner.query(`DROP TYPE "option_enabled_in_segments_enum"`);
        await queryRunner.query(`DROP TYPE "option_type_enum"`);
    }

}
