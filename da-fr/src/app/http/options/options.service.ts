import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from './../../models/options.entity';
import { Repository } from 'typeorm';
import { OptionDTO } from './options.dto';

@Injectable()
export class OptionsService {
    constructor(@InjectRepository(Option) private readonly repo: Repository<Option>) {}
    
    public async getAll(siteId: string): Promise<OptionDTO[]> {
        return await (await this.repo.find({where: { site: siteId }}))
            .map(e => OptionDTO.fill(e));
    }

    public async create(dto: OptionDTO): Promise<OptionDTO> {
        return await this.repo.save(dto);
    }

    public async update(id: string, dto: OptionDTO): Promise<OptionDTO> {
        const data = { ...dto };
        data.updatedAt = new Date();
        const isUpdated = await this.repo.update(id, data);
        return OptionDTO.fill(await this.repo.findOne(id));
    }

    public async delete(id: string): Promise<boolean> {
        const obj = await this.repo.findOne(id);
        obj.deletedAt = new Date();
        const res = await this.repo.save(obj);
        return true;
    }

    public async fill(siteId: string, rows: OptionDTO[]): Promise<Number> {
        let filled = 0;
        if (rows.length) {
            const existing = (await this.getAll(siteId))
                .map(i => i.name);
            await rows.forEach(async (i) => {
                if (!existing.includes(i.name)) {
                    await this.create(i);
                    filled++;
                }
            });
        }
        return filled;
    }
}
