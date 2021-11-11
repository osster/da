import { InjectQueue, OnQueueCompleted, OnQueueError, OnQueueFailed, OnQueueProgress, Process, Processor } from "@nestjs/bull";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job, Queue } from "bull";
import { Repository } from "typeorm";
import { DbManageOnlinerCatalogOptions } from "../../libs/sources/onliner_catalog/db_manage.onliner.catalog.options";
import { DbManageOnlinerCatalogItems } from "../../libs/sources/onliner_catalog/db_manage.onliner.catalog.items";
import { Section } from "../../models/sections.entity";
import { Site } from "../../models/site.entity";
import { ParsedRepository } from "../../libs/helpers/db.helpers";

const crypto = require('crypto');

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
    Logger.verbose(`jobDbManageOnlinerCatalogOptions section ${job.data.sectionId} (pid ${process.pid})`, `job_dbmanage`); 
    await this.dbManageOnlinerCatalogOptions.run(job.data.sectionId);
    return  { 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
    };
  }

  @Process('jobDbManageOnlinerCatalogItems')
  async jobDbManageOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string }>) {
    // Logger.verbose(`jobDbManageOnlinerCatalogItems section ${job.data.sectionId} (pid ${process.pid})`, `job_dbmanage`);
    const tmpTableName = `t_${crypto.createHash('md5').update(`${job.data.sectionId}`).digest('hex')}`;
    const repo = new ParsedRepository(tmpTableName);
    const items = await repo.getAll();
    let index = 0, total = items.length;
    for (const item of items) {
      if (item && item.raw !== null) {
        this.queueDbManage.add(
            'jobDbManageOnlinerCatalogItem',
            {
                sectionId: job.data.sectionId,
                itemId: item.id,
                index,
                total
            },
            {
                delay: index * 100,
                timeout: 6000,
            }
        );
      }
      index++;
    }
    return  { 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
    };
  }

  @Process('jobDbManageOnlinerCatalogItem')
  async jobDbManageOnlinerCatalogItem(job: Job<{ sectionId: string, itemId: string, index: number, total: number }>) {
    Logger.verbose(`jobDbManageOnlinerCatalogItem section ${job.data.sectionId}. (pid ${process.pid})`, `job_dbmanage`);
    await this.dbManageOnlinerCatalogItems.run(job.data.sectionId, job.data.itemId, job.data.index, job.data.total);
    return  {
      sectionId: job.data.sectionId,
      itemId: job.data.itemId,
      index: job.data.index,
      total: job.data.total,
    };
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`jobDbManageOnliner progress ${progress} (pid ${process.pid})`, `job_dbmanage`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    Logger.verbose(`jobDbManageOnliner section ${job.data.sectionId} completed (pid ${process.pid})`, `job_dbmanage`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, result: any) {
    Logger.error(`jobDbManageOnliner section ${job.data.sectionId} fails (pid ${process.pid})`, `job_dbmanage`);
    console.log(result)
  }

  @OnQueueError()
  async onError(job: Job, result: any) {
    Logger.error(`jobDbManageOnliner section ${job.data.sectionId} error (pid ${process.pid})`, `job_dbmanage`);
  }
}