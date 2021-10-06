import {MigrationInterface, QueryRunner} from "typeorm";

export class addDictionariesTable1633473319612 implements MigrationInterface {
    name = 'addDictionariesTable1633473319612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ADD "optionId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ADD CONSTRAINT "FK_d14a6d0df71d3c09775e33ebacc" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."dictionary" DROP CONSTRAINT "FK_d14a6d0df71d3c09775e33ebacc"`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" DROP COLUMN "optionId"`);
    }

}
