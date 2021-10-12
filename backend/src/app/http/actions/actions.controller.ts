import { Controller, Param, Post } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ScrapService } from '../../jobs/scrap/scrap.service';
import { ParseService } from '../../jobs/parse/parse.service';
import { Logger } from '@nestjs/common';
import { OptionsService } from '../options/options.service';
import { Option } from '../../models/options.entity';
import { OptionDTO } from '../options/options.dto';
import { DictionaryDTO } from '../dictionaries/dictionaries.dto';
import { DictionariesService } from '../dictionaries/dictionaries.service';
import { SiteDTO } from '../sites/sites.dto';

@Controller('actions')
export class ActionsController {
    constructor(
        private actionsSrv: ActionsService,
        private optionsSrv: OptionsService,
        private dictionariesSrv: DictionariesService,
        private scrapSrv: ScrapService, 
        private parseSrv: ParseService, 
    ) {
        
        this.scrapSrv.on('completed', (job, result) => {
            const siteId = job.data.siteId;
            const sectionId = result.sectionId;
            if (result && result.filePath) {
                const filePath = result.filePath;
                // console.log('parse options', {
                //     jobData: job.data,
                //     siteId,
                //     sectionId,
                //     filePath
                // });
                this.parseSrv.jobParseOnliner({
                    siteId,
                    sectionId,
                    filePath
                });
            } else {
                Logger.error(`Something went wrong due scrapping ${siteId}. File path not found.`);
            }
        });
        
        this.parseSrv.on('completed', async (job, result) => {
            const siteId = job.data.siteId;
            const sectionId = job.data.sectionId;
            const filePath = job.data.filePath;
            // Store
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
        });
    }

    @Post('/scan/:site_id') 
    public async scan(
        @Param('site_id') siteId: string
    ): Promise<any> {
        const site: SiteDTO = await this.actionsSrv.getSite(siteId);
        const sections = await this.actionsSrv.getSections(siteId);
        // const options = await this.actionsSrv.getOptions(siteId, sections.map(s => s.id));
        this.scrapSrv.jobScrapOnliner({
            site,
            sections,
        });
        return { siteId }
    }
}