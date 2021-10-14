import { OnQueueCompleted, OnQueueError, OnQueueFailed, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { In, Repository, QueryRunner, Connection, getConnection } from 'typeorm';
import { Site } from '../../models/site.entity';
import { Section } from '../../models/sections.entity';
import { Option } from '../../models/options.entity';
import { ParsedOnlinerCatalogItem } from '../parse/libs/parse.onliner.catalog.items';
import DbManageOnlinerCatalogOptions from './libs/onliner_catalog/db_manage.onliner.catalog.options';
import DbManageOnlinerCatalogItems from './libs/onliner_catalog/db_manage.onliner.catalog.items';
const crypto = require('crypto');

@Injectable()
@Processor('queueDbManage')
export class DbManageProcess {

  private queryRunner: QueryRunner;
  
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>
  ) {
    const connection: Connection = getConnection();
    this.queryRunner = connection.createQueryRunner();
    this.queryRunner.connect();
  }

  @Process('jobDbManageOnlinerCatalogOptions')
  async jobDbManageOnlinerCatalogOptions(job: Job<{ siteId: string, sectionId: string }>) {
    Logger.verbose(`jobDbManageOnlinerCatalogOptions ${job.data.siteId} ${job.data.sectionId} (pid ${process.pid})`, `queue_db_manage`);
    const dbManager = new DbManageOnlinerCatalogOptions(this.sectionRepository);    
    await dbManager.run(job.data.sectionId);
    return  { 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
    };
  }

  @Process('jobDbManageOnlinerCatalogItems')
  async jobDbManageOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string, items: ParsedOnlinerCatalogItem[], page: number, pages: any }>) {
    Logger.verbose(`jobDbManageOnlinerCatalogItems ${job.data.sectionId} ${job.data.items.length} items (pid ${process.pid})`, `queue_db_manage`);
    const dbManager = new DbManageOnlinerCatalogItems(this.sectionRepository); 
    await dbManager.run(job.data.sectionId, job.data.items);
    return  { 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
      page: job.data.page,
      pages: job.data.pages,
    };
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`jobDbManageOnliner progress ${progress} (pid ${process.pid})`, `queue_db_manage`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    Logger.verbose(`jobDbManageOnliner${job.data.sectionId} completed (pid ${process.pid})`, `queue_db_manage`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, result: any) {
    Logger.verbose(`jobDbManageOnliner ${job.data.sectionId} fails (pid ${process.pid})`, `queue_db_manage`);
  }

  @OnQueueError()
  async onError(job: Job, result: any) {
    Logger.verbose(`jobDbManageOnliner ${job.data.sectionId} error (pid ${process.pid})`, `queue_db_manage`);
  }
}