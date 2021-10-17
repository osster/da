import { Injectable, Logger, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Section } from '../../../models/sections.entity';
import { Connection, getConnection, Repository } from 'typeorm';
import { getHtml, getJson, storeHtml, storeJson } from '../../helpers/parser.helpers';
import { Site } from '../../../models/site.entity';

const moment = require('moment');
const crypto = require('crypto');

@Injectable()
export class ScrapOnlinerCatalogDetail {
    constructor(
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) {}

    public async run(
        siteId: string,
        sectionId: string,
        itemId: string
    ) {
        try {
            const connection: Connection = getConnection();
            const queryRunner = connection.createQueryRunner();
            await queryRunner.connect();
            const tableName = `t_${crypto.createHash('md5').update(`${siteId}_${sectionId}`).digest('hex')}`;
            const items = await queryRunner.query(`
                SELECT *
                FROM ${tableName}
                WHERE id = '${itemId}';
            `);
            if (items.length === 0) {
                throw new Error(`Item '${itemId}' not foind at '${tableName}'`);
            }
            const item = items[0];
            const html = await getHtml(item.html_url);
            const date = moment().format('YYYYMMDD');
            const filePath = storeHtml(html, `${date}_${itemId}_onliner_catalog_detail`);
            return { 
                siteId,
                sectionId,
                itemId,
                filePath,
                url: item.html_url,
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
export class ScrapOnlinerCatalogDetailModule {}