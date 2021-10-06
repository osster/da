import {MigrationInterface, QueryRunner} from "typeorm";

export class addSectionsTable1633513755590 implements MigrationInterface {
    name = 'addSectionsTable1633513755590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(100) NOT NULL, "uri" character varying(300) NOT NULL, "description" text, "siteId" uuid, CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "option_sections_section" ("optionId" uuid NOT NULL, "sectionId" uuid NOT NULL, CONSTRAINT "PK_dfa28e63174cd3a6619521d569c" PRIMARY KEY ("optionId", "sectionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_286dfaf66285fbd74914496e54" ON "option_sections_section" ("optionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2eddeedee5e69b2fdcf14fdabd" ON "option_sections_section" ("sectionId") `);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deletedAt" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "section" ADD CONSTRAINT "FK_a8ba9edaed6a810d26d8d898542" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "option_sections_section" ADD CONSTRAINT "FK_286dfaf66285fbd74914496e546" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "option_sections_section" ADD CONSTRAINT "FK_2eddeedee5e69b2fdcf14fdabd3" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "option_sections_section" DROP CONSTRAINT "FK_2eddeedee5e69b2fdcf14fdabd3"`);
        await queryRunner.query(`ALTER TABLE "option_sections_section" DROP CONSTRAINT "FK_286dfaf66285fbd74914496e546"`);
        await queryRunner.query(`ALTER TABLE "section" DROP CONSTRAINT "FK_a8ba9edaed6a810d26d8d898542"`);
        await queryRunner.query(`ALTER TABLE "public"."dictionary" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."option" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."site" ALTER COLUMN "deletedAt" DROP DEFAULT`);
        await queryRunner.query(`DROP INDEX "IDX_2eddeedee5e69b2fdcf14fdabd"`);
        await queryRunner.query(`DROP INDEX "IDX_286dfaf66285fbd74914496e54"`);
        await queryRunner.query(`DROP TABLE "option_sections_section"`);
        await queryRunner.query(`DROP TABLE "section"`);
    }

}
