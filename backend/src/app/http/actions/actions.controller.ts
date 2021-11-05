import { Controller, Injectable, Param, Post } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from '../../models/sections.entity';
import { Connection, getConnection, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';

const crypto = require('crypto');

@Injectable()
@Controller('actions')
export class ActionsController {
    constructor(
        @InjectQueue('queueScrap')
        private readonly queueScrap: Queue,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
    ) { }

    @Post('/scan/:site_id/options')
    public async scanOptions(
        @Param('site_id') siteId: string
    ): Promise<{ siteId: string }> {
        const sections = await this.sectionRepo.find({ where: { site: siteId } });
        sections.forEach((section) => {
            // Scrap options
            this.queueScrap.add('jobScrapOnlinerCatalogOptions', {
                siteId,
                sectionId: section.id,
            });
        });
        return { siteId }
    }

    @Post('/scan/:site_id/items')
    public async scanItems(
        @Param('site_id') siteId: string
    ): Promise<{ siteId: string }> {
        const sections: Section[] = await this.sectionRepo.find({ where: { site: siteId } });
        sections.forEach(async (section: Section) => {
            await this.queueScrap.add('jobScrapOnlinerCatalogItems', {
                siteId,
                sectionId: section.id,
                page: 1,
            });
        });
        return { siteId }
    }

    @Post('/scan/:site_id/detail')
    public async scanDetail(
        @Param('site_id') siteId: string
    ): Promise<{ siteId: string }> {
        const connection: Connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();

        const sections: Section[] = await this.sectionRepo.find({
            where: { site: siteId },
            relations: ['site'],
        });
        let delay = 0;
        for (const section of sections) {
            const tableName = `t_${crypto.createHash('md5').update(`${section.id}`).digest('hex')}`;
            const items = await queryRunner.query(`
                SELECT *
                FROM ${tableName};
            `);
            const total = items.length;
            let i = 0;
            for (const item of items) {
                await this.queueScrap.add(
                    'jobScrapOnlinerCatalogDetail',
                    {
                        siteId,
                        sectionId: section.id,
                        itemId: item.id,
                        url: item.url,
                        index: i,
                        total,
                    },
                    {
                        delay: delay * 2500,
                        timeout: 30000,
                    }
                );
                i++;
                delay++;
                // if (delay === 100) return;
            }
        }
        return { siteId }
    }
}
