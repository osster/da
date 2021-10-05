import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from '../../models/options.entity';
import { Repository } from 'typeorm';
import { OptionDTO } from '../options/options.dto';

@Injectable()
export class ActionsService {
    constructor(
        @InjectRepository(Option)
        private readonly repo: Repository<Option>
    ) {}

    public async processOptions(siteId: string, options: []) {
        return await (await this.repo.find({where: {siteId}}))
            .map(e => OptionDTO.fill(e));
    }

    // public async parse(siteId: string, fileName: string) {
    //     // return await this.parserQueue.add('parse-onliner', { siteId, fileName });
    // }
}
