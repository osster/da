import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dictionary } from '../../models/dictionary.entity';
import { Repository } from 'typeorm';
import { DictionaryDTO } from './dictionaries.dto';

@Injectable()
export class DictionariesService {
    constructor(@InjectRepository(Dictionary) private readonly repo: Repository<Dictionary>) {}
    
    public async getAll(siteId: string, optionId?: string, key?: string): Promise<DictionaryDTO[]> {
        return (await this.repo.find({
            //select: ['id', 'key', 'name', "site", "option"],
            where: { 
                site: siteId,
                option: optionId,
                key: key,
            },
            relations: ['site', 'option'],
        }))
            .map(e => DictionaryDTO.fill(e));
    }

    public async create(dto: DictionaryDTO): Promise<DictionaryDTO> {
        return await this.repo.save(dto);
    }

    public async update(id: string, dto: DictionaryDTO): Promise<DictionaryDTO> {
        const data = { ...dto };
        data.updatedAt = new Date();
        const isUpdated = await this.repo.update(id, data);
        return DictionaryDTO.fill(await this.repo.findOne(id));
    }

    public async delete(id: string): Promise<boolean> {
        const obj = await this.repo.findOne(id);
        obj.deletedAt = new Date();
        const res = await this.repo.save(obj);
        return true;
    }

    public async fill(siteId: string, rows: any[]): Promise<Number[]> {
        let filled = 0;
        let updated = 0;
        if (rows.length) {
            for (const i of rows) {
                const existing = (await this.repo.findOne({
                    where: { 
                        site: siteId,
                        option: i.option,
                        key: i.key,
                    },
                })); 
                if (!existing) {
                    filled++;
                    await this.create(i);
                } else {
                    updated++;
                    const item = DictionaryDTO.fill(Object.assign(DictionaryDTO.fill(existing), {
                        name: i.name,
                        site: i.site,
                        option: i.option,
                    }));
                    await this.update(item.id, item);
                }
            }
        }
        return [filled, updated];
    }
}
