import {MigrationInterface, QueryRunner} from "typeorm";

export class alterOptionsTable1633465363599 implements MigrationInterface {
    name = 'alterOptionsTable1633465363599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "dictionary_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "bool_type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "public"."option" ADD "unit" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "ratio" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "operation" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "operation" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "ratio" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "public"."option" ADD "unit" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "bool_type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "dictionary_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
    }

}
