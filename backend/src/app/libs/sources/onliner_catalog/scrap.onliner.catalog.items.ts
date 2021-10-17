import { Injectable, Logger, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Section } from '../../../models/sections.entity';
import { Repository } from 'typeorm';
import { getJson, storeJson } from '../../helpers/parser.helpers';
import { Site } from '../../../models/site.entity';

const moment = require('moment');

@Injectable()
export class ScrapOnlinerCatalogItems {
    constructor(
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {}

    public async run(
        siteId: string,
        sectionId: string,
        page: number = 1
    ) {
        try {
            const site = await this.siteRepo.findOne(siteId);
            const section = await this.sectionRepo.findOne(sectionId);
            const url =  `https://${site.host}/sdapi/catalog.api/search${section.uri}?group=1&page=${page}`;
            const json = await getJson(url);
            const date = moment().format('YYYYMMDD');
            const filePath = storeJson(json, `${date}_${page}_onliner_catalog_items`);
            return { 
                siteId,
                sectionId,
                url,
                page,
                filePath,
            };
        } catch (e) {
            console.error(e);
        }
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
        ]),
    ],
    providers: [
        ScrapOnlinerCatalogItems,
    ],
    exports: [
        ScrapOnlinerCatalogItems,
    ]
})
export class ScrapOnlinerCatalogItemsModule {}