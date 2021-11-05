import {MigrationInterface, QueryRunner} from "typeorm";

export class addProxiesTable1636151304742 implements MigrationInterface {
    name = 'addProxiesTable1636151304742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "proxy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "protocol" character varying(300) NOT NULL, "host" character varying(300) NOT NULL, "port" character varying(300) NOT NULL, "username" character varying(300) NOT NULL, "password" character varying(300) NOT NULL, "active" boolean NOT NULL DEFAULT true, "tryed_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, CONSTRAINT "PK_581edf779fc90b8d2687c658276" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary_item" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."group" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."group" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary_item" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "proxy"`);
    }

}
