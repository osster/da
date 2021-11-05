import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getConnection, QueryRunner, Repository } from 'typeorm';
import { Section } from '../../models/sections.entity';
import { Site } from '../../models/site.entity';
import { SectionDTO } from './sections.dto';

const crypto = require('crypto');

@Injectable()
export class SectionsService {
    private connection: Connection;
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Section>,
    ) {
        this.connection = getConnection();
    }
    
public async getAll(siteId: string): Promise<SectionDTO[]> {
    return (await this.sectionRepo.find({where: { site: siteId }, relations: ['site']}))
        .map(e => SectionDTO.fill(e));
}

public async create(siteId: string, dto: SectionDTO): Promise<SectionDTO> {
    const site = await this.siteRepo.findOne(siteId);
    const section = await this.sectionRepo.save({
        ...dto,
        site: site,
    });
    // Create items table
    await this.createItemsTable(section.id);
    return SectionDTO.fill(section);
}

private async createItemsTable(sectionId: string) {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    const tableName = `t_${crypto.createHash('md5').update(`${sectionId}`).digest('hex')}`;
    const hash = crypto.createHash('md5').update(tableName).digest('hex');
    await queryRunner.query(`
        CREATE TABLE "${tableName}" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        "key" character varying(300) NOT NULL,
        "url" character varying(300) NOT NULL,
        "name" character varying(300) NOT NULL,
        "description" text NULL,
        "images" text ARRAY NULL,
        "parsed_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        "raw" json DEFAULT NULL,
        CONSTRAINT "PK_${hash}" PRIMARY KEY ("id")
        )
    `);
  await queryRunner.query(`CREATE INDEX "IDX_${tableName}_key" ON "${tableName}" ("key");`);
}

public async update(id: string, dto: SectionDTO): Promise<SectionDTO> {
    const data = { ...dto };
    data.updated_at = new Date();
    const isUpdated = await this.sectionRepo.update(id, data);
    return SectionDTO.fill(await this.sectionRepo.findOne(id));
}

public async delete(id: string): Promise<boolean> {
    const obj = await this.sectionRepo.findOne(id);
    obj.deleted_at = new Date();
    const res = await this.sectionRepo.save(obj);
    return true;
}

public async fill(siteId: string, rows: SectionDTO[]): Promise<Number> {
    let filled = 0;
    if (rows.length) {
        const existing = (await this.getAll(siteId))
            .map(i => i.name);
        await rows.forEach(async (i) => {
            if (!existing.includes(i.name)) {
                filled++;
                await this.create(siteId, i);
            }
        });
    }
    return filled;
}
}
