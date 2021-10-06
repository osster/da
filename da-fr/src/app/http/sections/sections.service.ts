import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from '../../models/sections.entity';
import { Connection, ConnectionManager, getConnection, Repository } from 'typeorm';
import { SectionDTO } from './sections.dto';
import { Site } from '../../models/site.entity';

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
    // await this.connection.manager.save(section);
    return SectionDTO.fill(section);
}

public async update(id: string, dto: SectionDTO): Promise<SectionDTO> {
    const data = { ...dto };
    data.updatedAt = new Date();
    const isUpdated = await this.sectionRepo.update(id, data);
    return SectionDTO.fill(await this.sectionRepo.findOne(id));
}

public async delete(id: string): Promise<boolean> {
    const obj = await this.sectionRepo.findOne(id);
    obj.deletedAt = new Date();
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
