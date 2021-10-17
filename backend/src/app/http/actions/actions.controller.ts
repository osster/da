import { Controller, Injectable, Param, Post } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ScrapService } from '../../jobs/scrap/scrap.service';
import { ParseService } from '../../jobs/parse/parse.service';
import { DbManageService } from '../../jobs/db_manage/db_manage.service';
import { Logger } from '@nestjs/common';
import { OptionsService } from '../options/options.service';
import { OptionDTO } from '../options/options.dto';
import { DictionaryDTO } from '../dictionaries/dictionaries.dto';
import { DictionariesService } from '../dictionaries/dictionaries.service';
import { SiteDTO } from '../sites/sites.dto';
import { Job, Queue } from 'bull';
import { SectionDTO } from '../sections/sections.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from '../../models/sections.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';

const workerFarm = require('worker-farm');

@Injectable()
@Controller('actions')
export class ActionsController {
    constructor(
        @InjectQueue('queueScrap')
        private readonly queueScrap: Queue,
        @InjectQueue('queueParse')
        private readonly queueParse: Queue,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        private actionsSrv: ActionsService,
        private optionsSrv: OptionsService,
        private dictionariesSrv: DictionariesService,
        private scrapSrv: ScrapService, 
        private parseSrv: ParseService, 
        private dbManageSrv: DbManageService, 
    ) {
        
        // this.scrapSrv.on('completed', async (job: Job, result) => {
        //     this.actionsSrv.onScrapped(job, result);
        // });
        
        // this.parseSrv.on('completed', async (job: Job, result) => {
        //     this.actionsSrv.onParsed(job, result);
        // });

        this.dbManageSrv.on('completed', async (job: Job, result) => {
            const siteId = job.data.siteId;
            const sectionId = job.data.sectionId;
            Logger.verbose(`DB managed ${job.name}.`, 'db_manage');
            if (result.pages && result.page > 0) {
                if (result.pages.last > result.page) {
                    setTimeout(async () => {
                        console.log('run page scanner', result.page + 1, result.pages);
                        await this.queueScrap.add('jobScrapOnlinerCatalogItems', { 
                            siteId,
                            sectionId,
                            page: result.page + 1
                         });
                    }, 1000);
                }
            }
        });
    }

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
}
