import {MigrationInterface, QueryRunner} from "typeorm";

export class alterGoupsAddSiteRelationUpd1634855635570 implements MigrationInterface {
    name = 'alterGoupsAddSiteRelationUpd1634855635570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."group" ADD "siteId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."group" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary_item" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."group" ADD CONSTRAINT "FK_562d704983bb7da9110161c9ac6" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."group" DROP CONSTRAINT "FK_562d704983bb7da9110161c9ac6"`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary_item" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."group" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."group" DROP COLUMN "siteId"`);
    }

}
