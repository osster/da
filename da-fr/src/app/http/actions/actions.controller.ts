import { Controller, Param, Post } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ScrapService } from '../../jobs/scrap/scrap.service';
import { ParseService } from '../../jobs/parse/parse.service';
import { Logger } from '@nestjs/common';
import { OptionsService } from '../options/options.service';
import { Option } from 'src/app/models/options.entity';
import { OptionDTO } from '../options/options.dto';

@Controller('actions')
export class ActionsController {
    constructor(
        private optionsSrv: OptionsService,
        private scrapSrv: ScrapService, 
        private parseSrv: ParseService, 
    ) {}

    @Post('/scan/:site_id') 
    public async scan(
        @Param('site_id') siteId: string
    ): Promise<any> {
        this.scrapSrv.on('completed', (job, result) => {
            if (result && result.filePath) {
                const filePath = result.filePath;
                this.parseSrv.on('completed', async (job, result) => {
                    // Store
                    const data =  (result && result.options && result.options.length)
                        ? result.options.map((o) => OptionDTO.fill({
                            ...o,
                            site: siteId
                        })) 
                        : [];
                    Logger.verbose(`File ${filePath} for ${siteId} parsed ${data.length} items.`, 'scan');
                    // console.log({ data });
                    const filled = await this.optionsSrv.fill(siteId, data);
                    Logger.verbose(`Stored ${filled} items.`, 'store');
                    console.log({ filled })
                });
                this.parseSrv.jobParseOnliner(siteId, filePath);
            } else {
                Logger.error(`Something went wrong due scrapping ${siteId}. File path not found.`);
            }
        });
        this.scrapSrv.jobScrapOnliner(siteId);
        // ScanOnlinerCatalogQueue.on('completed', (job, result) => {
        //     console.log('Job `ScanOnlinerCatalogQueue` completed with output result!', result);
        //     ParseOnlinerCatalogQueue.add({ 
        //         file: result.file,
        //         srv: () => { console.log('someone') },
        //     });
        //     ParseOnlinerCatalogQueue.on('completed', (job, result) => {
        //         console.log('Job `ParseOnlinerCatalogQueue` completed with output result!', result);
        //     });
        // });
        // ScanOnlinerCatalogQueue.on('progress', function (job, progress) {
        //     console.log({ progress });
        // });
        // ScanOnlinerCatalogQueue.add({ siteId });
        return { siteId }
    }
}
