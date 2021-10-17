import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from '../../models/options.entity';
import { In, Repository } from 'typeorm';
import { OptionDTO } from '../options/options.dto';
import { Site } from '../../models/site.entity';
import { Section } from '../../models/sections.entity';
import { SiteDTO } from '../sites/sites.dto';
import { SectionDTO } from '../sections/sections.dto';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class ActionsService {
    constructor(
        @InjectRepository(Option)
        private readonly optionRepo: Repository<Option>,
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {}

    public async getSite(siteId: string) {
        const site = await this.siteRepo.findOne(siteId);
        return site ? SiteDTO.fill(site) : null;
    }

    public async getSections(siteId: string) {
        return await (await this.sectionRepo.find({where: { site: siteId }}))
            .map(e => SectionDTO.fill(e));
    }

    public async getOptions(siteId: string, sectionId: string[]) {
        return await (await this.optionRepo.find({
            where: {
                site: siteId,
                sections: In(sectionId)
            },
        }))
            .map(e => OptionDTO.fill(e));
    }
}
