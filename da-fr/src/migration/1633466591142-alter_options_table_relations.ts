import {MigrationInterface, QueryRunner} from "typeorm";

export class alterOptionsTableRelations1633466591142 implements MigrationInterface {
    name = 'alterOptionsTableRelations1633466591142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."option" ADD "siteId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ADD CONSTRAINT "FK_614036867e88eb0578461a8e90c" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."option" DROP CONSTRAINT "FK_614036867e88eb0578461a8e90c"`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" DROP COLUMN "siteId"`);
    }

}
