import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterOptionType1636583793693 implements MigrationInterface {
    name = 'AlterOptionType1636583793693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."dictionary_item" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."option_type_enum" RENAME TO "option_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."option_type_enum" AS ENUM('boolean', 'dictionary', 'number_range', 'dictionary_range', 'string')`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "type" TYPE "public"."option_type_enum" USING "type"::"text"::"public"."option_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."option_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "public"."group" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."proxy" ALTER COLUMN "deleted_at" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."proxy" ALTER COLUMN "tryed_at" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."proxy" ALTER COLUMN "tryed_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."proxy" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."section" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."group" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."option_type_enum_old" AS ENUM('boolean', 'dictionary', 'number_range', 'dictionary_range')`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "type" TYPE "public"."option_type_enum_old" USING "type"::"text"::"public"."option_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."option_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."option_type_enum_old" RENAME TO "option_type_enum"`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deleted_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary_item" ALTER COLUMN "deleted_at" DROP DEFAULT`);
    }

}
