import { Controller, Param, Post } from '@nestjs/common';
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
import { Job } from 'bull';
import { SectionDTO } from '../sections/sections.dto';

@Controller('actions')
export class ActionsController {
    constructor(
        private actionsSrv: ActionsService,
        private optionsSrv: OptionsService,
        private dictionariesSrv: DictionariesService,
        private scrapSrv: ScrapService, 
        private parseSrv: ParseService, 
        private dbManageSrv: DbManageService, 
    ) {
        
        this.scrapSrv.on('completed', (job: Job, result) => {
            const siteId = job.data.siteId;
            const sectionId = result.sectionId;
            const page = result.page;
            if (result && result.filePath) {
                const filePath = result.filePath;
                switch (job.name) {
                    case 'jobScrapOnlinerCatalogOptions': 
                        this.parseSrv.jobParseOnlinerCatalogOptions({
                            siteId,
                            sectionId,
                            filePath
                        });
                        break;
                    case 'jobScrapOnlinerCatalogItems': 
                        this.parseSrv.jobParseOnlinerCatalogItems({
                            siteId,
                            sectionId,
                            filePath,
                            page,
                        });
                        break;
                }
            } else {
                Logger.error(`Something went wrong due scrapping ${siteId}. File path not found.`);
            }
        });
        
        this.parseSrv.on('completed', async (job: Job, result) => {
            const siteId = job.data.siteId;
            const sectionId = job.data.sectionId;
            const filePath = job.data.filePath;

            switch(job.name) {
                case 'jobParseOnlinerCatalogOptions':
                    // TODO: move to job process Store
                    const optionsData =  (result && result.options && result.options.length)
                    ? result.options.map((o) => {
                        return OptionDTO.fill({
                            ...o,
                            site: siteId,
                            sections: [sectionId],
                        });
                    }) 
                    : [];
                    Logger.verbose(`File ${filePath} for ${siteId} parsed ${optionsData.length} items.`, 'scan');
                    const filled = await this.optionsSrv.fill(siteId, optionsData);
                    Logger.verbose(`Stored ${filled} items.`, 'store');

                    const dictionariesData = [];
                    if (result && result.dictionaries && result.dictionaries.length) {
                        const options = await this.optionsSrv.getByParameterIdIn(siteId, result.dictionaries.map(d => d.key));
                        const dictionariesFiltered = result.dictionaries
                            .map((d) => {
                                const opt = options.find(o => o.parameter_id === d.key);
                                d.site = siteId;
                                d.option = opt ? opt.id : null;
                                return d;
                            })
                            .filter(d => d.option !== null);

                            dictionariesFiltered.forEach((d) => {
                                if (d.values && d.values.length) { 
                                    d.values.forEach((dv) => {
                                        dictionariesData.push(
                                            DictionaryDTO.fill({
                                                key: dv.id,
                                                name: dv.name,
                                                site: d.site,
                                                option: d.option, 
                                            })
                                        );
                                    });
                                } else {
                                    Logger.error(`dictionary values not found.`, 'scan');
                                }
                            })
                    }
                    Logger.verbose(`File ${filePath} for ${siteId} parsed ${dictionariesData.length} dictionaries.`, 'scan');
                    if (dictionariesData.length) {
                        const res = await this.dictionariesSrv.fill(siteId, dictionariesData);
                        Logger.verbose(`Stored ${res[0]} dictionaries, updated ${res[1]}.`, 'store');
                    }
                    this.dbManageSrv.jobDbManageOnlinerCatalogOptions({ siteId, sectionId });
                    break;
                case 'jobParseOnlinerCatalogItems':
                    await this.dbManageSrv.jobDbManageOnlinerCatalogItems({ siteId, sectionId, items: result.items, page: result.page, pages: result.pages });
                    break;
            }

        });

        this.dbManageSrv.on('completed', async (job: Job, result) => {
            const siteId = job.data.siteId;
            const sectionId = job.data.sectionId;
            Logger.verbose(`DB managed ${job.name}.`, 'db_manage');
            if (result.pages && result.page > 0) {
                const site: SiteDTO = await this.actionsSrv.getSite(siteId);
                const sections: SectionDTO[] = await this.actionsSrv.getSections(siteId);
                if (result.pages.last > result.page) {
                    setTimeout(async () => {
                        console.log('run page scanner', result.page + 1, result.pages);
                        await this.scrapSrv.jobScrapOnlinerCatalogItems({
                            site,
                            section: sections.find(s => s.id === sectionId),
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
    ): Promise<any> {
        const site: SiteDTO = await this.actionsSrv.getSite(siteId);
        const sections: SectionDTO[] = await this.actionsSrv.getSections(siteId);
        this.scrapSrv.jobScrapOnlinerCatalogOptions({
            site,
            sections,
        });
        return { siteId }
    }

    @Post('/scan/:site_id/items') 
    public async scanItems(
        @Param('site_id') siteId: string
    ): Promise<any> {
        const site: SiteDTO = await this.actionsSrv.getSite(siteId);
        const sections: SectionDTO[] = await this.actionsSrv.getSections(siteId);
        sections.forEach(async (section) => {
            await this.scrapSrv.jobScrapOnlinerCatalogItems({
                site,
                section,
                page: 1
            });
        });
        return { siteId }
    }
}
