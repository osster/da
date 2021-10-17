import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Section } from '../../../models/sections.entity';
import { Site } from '../../../models/site.entity';
import { Repository } from 'typeorm';
import { getJson, storeJson } from '../../../libs/helpers/parser.helpers';
const moment = require('moment');

@Injectable()
export class ScrapOnlinerCatalogOptions {
    constructor(
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {}

    public async run(siteId: string, sectionId: string) {
        const site: Site = await this.siteRepo.findOne(siteId);
        const section: Section = await this.sectionRepo.findOne({where: { site: siteId }});
        const date = moment().format('YYYYMMDD');
        const url = `https://${site.host}/sdapi/catalog.api/facets${section.uri}`;
        const json = await getJson(url);
        const filePath = storeJson(json, `${date}_onliner_catalog_options`);
        return {
            siteId,
            sectionId,
            url,
            filePath
        };
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
        ScrapOnlinerCatalogOptions,
    ],
    exports: [
        ScrapOnlinerCatalogOptions,
    ]
})
export class ScrapOnlinerCatalogOptionsModule {}