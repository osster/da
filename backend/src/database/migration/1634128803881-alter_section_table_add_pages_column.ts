import {MigrationInterface, QueryRunner} from "typeorm";

export class alterSectionTableAddPagesColumn1634128803881 implements MigrationInterface {
    name = 'alterSectionTableAddPagesColumn1634128803881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."section" ADD "pages" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."section" DROP COLUMN "pages"`);
    }

}
