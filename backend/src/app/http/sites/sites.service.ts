import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from './../../models/site.entity';
import { Repository } from 'typeorm';
import { SiteDTO } from './sites.dto';

@Injectable()
export class SitesService {
    constructor(@InjectRepository(Site) private readonly repo: Repository<Site>) {}

    public async getAll(): Promise<SiteDTO[]> {
        return await (await this.repo.find())
            .map(e => SiteDTO.fill(e));
    }

    public async create(dto: SiteDTO): Promise<SiteDTO> {
        return await this.repo.save(dto);
    }

    public async update(id: string, dto: SiteDTO): Promise<SiteDTO> {
        const data = { ...dto };
        data.updated_at = new Date();
        const isUpdated = await this.repo.update(id, data);
        return SiteDTO.fill(await this.repo.findOne(id));
    }

    public async delete(id: string): Promise<boolean> {
        const obj = await this.repo.findOne(id);
        obj.deleted_at = new Date();
        const res = await this.repo.save(obj);
        return true;
    }
}
