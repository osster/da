import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from './../../models/options.entity';
import { getConnection, In, Repository } from 'typeorm';
import { OptionDTO } from './options.dto';
import { Section } from '../../models/sections.entity';
import { SectionDTO } from '../sections/sections.dto';

@Injectable()
export class OptionsService {
    constructor(
        @InjectRepository(Option)
        private readonly repo: Repository<Option>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {}
    
    public async getAll(siteId: string): Promise<OptionDTO[]> {
        return (await this.repo.find({where: { site: siteId }, relations: ['site']}))
            .map(e => OptionDTO.fill(e));
    }
    
    public async getByParameterId(siteId: string, parameterId: string): Promise<OptionDTO[]> {
        const options = (await this.repo.find({where: { site: siteId, parameter_id: parameterId }, relations: ['site']}))
            .map(e => OptionDTO.fill(e));
        return options;
    }
    
    public async getByParameterIdIn(siteId: string, parameterIds: string[]): Promise<OptionDTO[]> {
        const options = (await this.repo.find({where: { site: siteId, parameter_id: In(parameterIds) }, relations: ['site']}))
            .map(e => OptionDTO.fill(e));
        return options;
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

    public async fill(siteId: string, rows: OptionDTO[]): Promise<Number[]> {
        let filled = 0;
        let updated = 0;
        if (rows.length) {
            for (const i of rows) {
                if (
                    i.name &&
                    i.name !== null && 
                    i.type && 
                    i.parameter_id
                ) {
                    const existing = (await this.repo.findOne({
                        where: { 
                            site: siteId,
                            name: i.name,
                        },
                        relations: ['sections']
                    })); 
                    if (
                        !existing
                    ) {
                        filled++;
                        await this.create(i);
                    } else {
                        const sections = await this.sectionRepo.find({
                            where: { id: In(i.sections) }
                        });
                        existing.sections.forEach((s) => {
                            if (sections.filter(_s => _s.id === s.id).length === 0) {
                                sections.push(s);
                            }
                        });
                        existing.name = i.name;
                        existing.description = i.description;
                        existing.type = i.type;  
                        existing.parameter_id = i.parameter_id;
                        existing.dictionary_id = i.dictionary_id;
                        existing.bool_type = i.bool_type;
                        existing.unit = i.unit;
                        existing.ratio = i.ratio;
                        existing.operation = i.operation;
                        existing.enabled_in_segments = i.enabled_in_segments;
                        existing.visible_in_segments = i.visible_in_segments;
                        existing.sections = sections;
                        const connection = getConnection();
                        connection.manager.save(existing);
                    }
                } else {
                    Logger.error(`Record is empty ${JSON.stringify(i)}`, 'fill_options');
                }
            }
        }
        return [filled, updated];
    }
}
