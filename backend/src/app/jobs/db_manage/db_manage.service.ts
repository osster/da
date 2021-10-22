import { InjectQueue, OnQueueCompleted, OnQueueError, OnQueueFailed, OnQueueProgress, Process, Processor } from "@nestjs/bull";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job, Queue } from "bull";
import { Repository } from "typeorm";
import { ParsedOnlinerCatalogItem } from "../../libs/sources/onliner_catalog/parse.onliner.catalog.items";
import { DbManageOnlinerCatalogOptions } from "../../libs/sources/onliner_catalog/db_manage.onliner.catalog.options";
import { DbManageOnlinerCatalogItems } from "../../libs/sources/onliner_catalog/db_manage.onliner.catalog.items";
import { Section } from "../../models/sections.entity";
import { Site } from "../../models/site.entity";

@Injectable()
@Processor('queueDbManage')
export class DbManageService {
    constructor(
        @InjectQueue('queueDbManage')
        private readonly queueDbManage: Queue,
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        @Inject(DbManageOnlinerCatalogOptions)
        private readonly dbManageOnlinerCatalogOptions: DbManageOnlinerCatalogOptions,
        @Inject(DbManageOnlinerCatalogItems)
        private readonly dbManageOnlinerCatalogItems: DbManageOnlinerCatalogItems,
    ) {}

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueDbManage
            .on(event, (job: any, result: any) => callback(job, result));
    }      

  @Process('jobDbManageOnlinerCatalogOptions')
  async jobDbManageOnlinerCatalogOptions(job: Job<{ siteId: string, sectionId: string }>) {
    Logger.verbose(`jobDbManageOnlinerCatalogOptions ${job.data.siteId} ${job.data.sectionId} (pid ${process.pid})`, `job_dbmanage`); 
    await this.dbManageOnlinerCatalogOptions.run(job.data.sectionId);
    return  { 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
    };
  }

  @Process('jobDbManageOnlinerCatalogItems')
  async jobDbManageOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string, items: ParsedOnlinerCatalogItem[], page: number, pages: any }>) {
    Logger.verbose(`jobDbManageOnlinerCatalogItems ${job.data.sectionId} ${job.data.items.length} items (pid ${process.pid})`, `job_dbmanage`);
    await this.dbManageOnlinerCatalogItems.run(job.data.siteId, job.data.sectionId, job.data.items);
    return  { 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
      page: job.data.page,
      pages: job.data.pages,
    };
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`jobDbManageOnliner progress ${progress} (pid ${process.pid})`, `job_dbmanage`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    Logger.verbose(`jobDbManageOnliner${job.data.sectionId} completed (pid ${process.pid})`, `job_dbmanage`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, result: any) {
    Logger.error(`jobDbManageOnliner ${job.data.sectionId} fails (pid ${process.pid})`, `job_dbmanage`);
  }

  @OnQueueError()
  async onError(job: Job, result: any) {
    Logger.error(`jobDbManageOnliner ${job.data.sectionId} error (pid ${process.pid})`, `job_dbmanage`);
  }
}