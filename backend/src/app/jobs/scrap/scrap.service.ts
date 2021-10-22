import { InjectQueue, OnQueueCompleted, Process, Processor } from "@nestjs/bull";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job, Queue } from "bull";
import { Section } from "../../models/sections.entity";
import { Repository } from "typeorm";
import { ScrapOnlinerCatalogOptions } from "../../libs/sources/onliner_catalog/scrap.onliner.catalog.options";
import { ScrapOnlinerCatalogItems } from "../../libs/sources/onliner_catalog/scrap.onliner.catalog.items";
import { ScrapOnlinerCatalogDetail, ScrapOnlinerCatalogDetailArgs } from "../../libs/sources/onliner_catalog/scrap.onliner.catalog.detail";
import { fstat } from "fs";

@Injectable()
@Processor('queueScrap')
export class ScrapService {
    constructor(
        @InjectQueue('queueScrap')
        private readonly queueScrap: Queue,
        @InjectQueue('queueParse')
        private readonly queueParse: Queue,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        @Inject(ScrapOnlinerCatalogOptions)
        private readonly scrapOnlinerCatalogOptions: ScrapOnlinerCatalogOptions,
        @Inject(ScrapOnlinerCatalogItems)
        private readonly scrapOnlinerCatalogItems: ScrapOnlinerCatalogItems,
        @Inject(ScrapOnlinerCatalogDetail)
        private readonly scrapOnlinerCatalogDetail: ScrapOnlinerCatalogDetail,
    ) { }

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueScrap
            .on(event, (job: any, result: any) => callback(job, result));
    }

    @Process('jobScrapOnlinerCatalogOptions')
    async jobScrapOnlinerCatalogOptions(job: Job<{ siteId: string, sectionId: string }>) {
        const data = await this.scrapOnlinerCatalogOptions.run(job.data.siteId, job.data.sectionId);
        Logger.verbose(`${job.data.siteId} (pid ${process.pid})`, `job_scrap_options`);
        return data;
    }
    @Process('jobScrapOnlinerCatalogItems')
    async jobScrapOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string, page: number }>) {
        const data = await this.scrapOnlinerCatalogItems.run(job.data.siteId, job.data.sectionId, job.data.page);
        Logger.verbose(`${job.data.siteId} page ${data.page} (pid ${process.pid})`, `job_scrap_items`);
        return data;
    }
    @Process('jobScrapOnlinerCatalogDetail')
    async jobScrapOnlinerCatalogDetail(job: Job<ScrapOnlinerCatalogDetailArgs>) {
        const data = await this.scrapOnlinerCatalogDetail.run(
            job.data.siteId,
            job.data.sectionId,
            job.data.itemId,
            job.data.url,
            job.data.index,
            job.data.total
        );
        Logger.verbose(`${job.data.siteId} item ${data.itemId} (pid ${process.pid})`, `job_scrap_detail`);
        return data;
    }

    @OnQueueCompleted()
    onCompleted(job: Job, result: any) {
        Logger.debug(`job completed ${job.name}`, 'job_scrap_completed');
        const siteId = job.data.siteId;
        const sectionId = result.sectionId;
        if (result && result.filePath) {
            const filePath = result.filePath;
            switch (job.name) {
                case 'jobScrapOnlinerCatalogOptions':
                    this.queueParse.add('jobParseOnlinerCatalogOptions', {
                        siteId,
                        sectionId,
                        filePath,
                    });
                    break;
                case 'jobScrapOnlinerCatalogItems':
                    const page = result.page;
                    this.queueParse.add('jobParseOnlinerCatalogPages', {
                        siteId,
                        sectionId,
                        filePath,
                    });
                    this.queueParse.add('jobParseOnlinerCatalogItems', {
                        siteId,
                        sectionId,
                        filePath,
                        page,
                    });
                    break;
                case 'jobScrapOnlinerCatalogDetail':
                    Logger.debug(`jobScrapOnlinerCatalogDetail`, 'job_scrap_detail');
                    const itemId = result.itemId;
                    const index = result.index;
                    const total = result.total;
                    this.queueParse.add('jobParseOnlinerCatalogDetail', {
                        siteId,
                        sectionId,
                        itemId,
                        filePath,
                        index,
                        total
                    });
                    //   setTimeout(() => {
                    //     // const fs = require('fs');
                    //     // fs.unlinkSync(filePath);
                    //     console.log('unlinkSync', filePath);
                    //   }, 10000);
                    break;
            }
        } else {
            Logger.error(`Something went wrong due scrapping ${siteId}. File path not found.`);
        }
        Logger.verbose(`${job.data.siteId} completed (pid ${process.pid})`, `job_parse`);
    }
}