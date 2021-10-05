import {MigrationInterface, QueryRunner} from "typeorm";

export class alterOptionsTableRelation1633465681148 implements MigrationInterface {
    name = 'alterOptionsTableRelation1633465681148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."option" DROP CONSTRAINT "FK_614036867e88eb0578461a8e90c"`);
        await queryRunner.query(`ALTER TABLE "public"."option" DROP CONSTRAINT "REL_614036867e88eb0578461a8e90"`);
        await queryRunner.query(`ALTER TABLE "public"."option" DROP COLUMN "siteId"`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" ADD "siteId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."option" ADD CONSTRAINT "REL_614036867e88eb0578461a8e90" UNIQUE ("siteId")`);
        await queryRunner.query(`ALTER TABLE "public"."option" ADD CONSTRAINT "FK_614036867e88eb0578461a8e90c" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
