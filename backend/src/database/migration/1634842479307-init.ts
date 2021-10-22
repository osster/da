import {MigrationInterface, QueryRunner} from "typeorm";

export class init1634842479307 implements MigrationInterface {
    name = 'init1634842479307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" text, "type" "option_type_enum", "parameter_id" character varying(100) NOT NULL, "bool_type" character varying(100), "unit" character varying(20), "ratio" numeric(12,2), "operation" character varying(100), "dictionaryId" uuid, CONSTRAINT "PK_e6090c1c6ad8962eea97abdbe63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(100) NOT NULL, "description" text, "uri" character varying(300) NOT NULL, "pages" integer NOT NULL DEFAULT '1', "siteId" uuid, CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "name" character varying(300) NOT NULL, "description" character varying(300) NOT NULL, "host" character varying(300) NOT NULL, "type" "site_type_enum", CONSTRAINT "PK_635c0eeabda8862d5b0237b42b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dictionary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "key" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "siteId" uuid, CONSTRAINT "PK_d17df343bd5d01ed62dd0e55e4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dictionary_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL, "key" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "dictionaryId" uuid, CONSTRAINT "PK_2fca955528c6e57d6c5a4eee00e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_options_option" ("groupId" uuid NOT NULL, "optionId" uuid NOT NULL, CONSTRAINT "PK_434657b00f2ee1029cd9f8943e3" PRIMARY KEY ("groupId", "optionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_570bb161b9c429e672dabf044f" ON "group_options_option" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fff261ecbb8fa55e990cc6468a" ON "group_options_option" ("optionId") `);
        await queryRunner.query(`CREATE TABLE "section_groups_group" ("sectionId" uuid NOT NULL, "groupId" uuid NOT NULL, CONSTRAINT "PK_20c510bef04ec0b7c426ce9e7ee" PRIMARY KEY ("sectionId", "groupId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a7c54c2ef5071e851c1d7d7c1f" ON "section_groups_group" ("sectionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b4140d6b4d51845c99fce6e19" ON "section_groups_group" ("groupId") `);
        await queryRunner.query(`ALTER TABLE "option" ADD CONSTRAINT "FK_99a5c10c804641177a3ab54b6f9" FOREIGN KEY ("dictionaryId") REFERENCES "dictionary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section" ADD CONSTRAINT "FK_a8ba9edaed6a810d26d8d898542" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dictionary" ADD CONSTRAINT "FK_220f489a8615a7188f98f2161cc" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dictionary_item" ADD CONSTRAINT "FK_8f2fc9462dc0a547a4453c48b15" FOREIGN KEY ("dictionaryId") REFERENCES "dictionary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_options_option" ADD CONSTRAINT "FK_570bb161b9c429e672dabf044fe" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_options_option" ADD CONSTRAINT "FK_fff261ecbb8fa55e990cc6468a9" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "section_groups_group" ADD CONSTRAINT "FK_a7c54c2ef5071e851c1d7d7c1fa" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "section_groups_group" ADD CONSTRAINT "FK_9b4140d6b4d51845c99fce6e192" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "section_groups_group" DROP CONSTRAINT "FK_9b4140d6b4d51845c99fce6e192"`);
        await queryRunner.query(`ALTER TABLE "section_groups_group" DROP CONSTRAINT "FK_a7c54c2ef5071e851c1d7d7c1fa"`);
        await queryRunner.query(`ALTER TABLE "group_options_option" DROP CONSTRAINT "FK_fff261ecbb8fa55e990cc6468a9"`);
        await queryRunner.query(`ALTER TABLE "group_options_option" DROP CONSTRAINT "FK_570bb161b9c429e672dabf044fe"`);
        await queryRunner.query(`ALTER TABLE "dictionary_item" DROP CONSTRAINT "FK_8f2fc9462dc0a547a4453c48b15"`);
        await queryRunner.query(`ALTER TABLE "dictionary" DROP CONSTRAINT "FK_220f489a8615a7188f98f2161cc"`);
        await queryRunner.query(`ALTER TABLE "section" DROP CONSTRAINT "FK_a8ba9edaed6a810d26d8d898542"`);
        await queryRunner.query(`ALTER TABLE "option" DROP CONSTRAINT "FK_99a5c10c804641177a3ab54b6f9"`);
        await queryRunner.query(`DROP INDEX "IDX_9b4140d6b4d51845c99fce6e19"`);
        await queryRunner.query(`DROP INDEX "IDX_a7c54c2ef5071e851c1d7d7c1f"`);
        await queryRunner.query(`DROP TABLE "section_groups_group"`);
        await queryRunner.query(`DROP INDEX "IDX_fff261ecbb8fa55e990cc6468a"`);
        await queryRunner.query(`DROP INDEX "IDX_570bb161b9c429e672dabf044f"`);
        await queryRunner.query(`DROP TABLE "group_options_option"`);
        await queryRunner.query(`DROP TABLE "dictionary_item"`);
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`DROP TABLE "site"`);
        await queryRunner.query(`DROP TABLE "section"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`DROP TABLE "option"`);
    }

}
