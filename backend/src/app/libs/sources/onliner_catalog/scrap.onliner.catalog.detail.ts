import { Injectable, Logger, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Section } from '../../../models/sections.entity';
import { Connection, getConnection, Repository } from 'typeorm';
import { getHtml, getJson, storeHtml, storeJson } from '../../helpers/parser.helpers';
import { Site } from '../../../models/site.entity';

const moment = require('moment');
const crypto = require('crypto');

export interface ScrapOnlinerCatalogDetailArgs {
    siteId: string,
    sectionId: string,
    itemId: string,
    url: string,
    index: number,
    total: number
};

@Injectable()
export class ScrapOnlinerCatalogDetail {
    private items: any[] = [];
    constructor(
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) { }

    public async run(
        siteId: string,
        sectionId: string,
        itemId: string,
        url: string,
        index: number,
        total: number,
    ) {
        try {
            const html = await getHtml(url);
            const date = moment().format('YYYYMMDD');
            const filePath = storeHtml(html, `${date}_${itemId}_onliner_catalog_detail`);
            return {
                siteId,
                sectionId,
                itemId,
                filePath,
                url,
                index,
                total
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
        ScrapOnlinerCatalogDetail,
    ],
    exports: [
        ScrapOnlinerCatalogDetail,
    ]
})
export class ScrapOnlinerCatalogDetailModule { }