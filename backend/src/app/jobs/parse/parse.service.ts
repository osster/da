import { InjectQueue, OnQueueCompleted, OnQueueProgress, Process, Processor } from "@nestjs/bull";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Job, Queue } from "bull";
import { ParseOnlinerCatalogDetail, ParseOnlinerCatalogDetailArgs } from "../../libs/sources/onliner_catalog/parse.onliner.catalog.detail";
import { ParseOnlinerCatalogItems } from "../../libs/sources/onliner_catalog/parse.onliner.catalog.items";
import { ParseOnlinerCatalogOptions } from "../../libs/sources/onliner_catalog/parse.onliner.catalog.options";
import { ParseOnlinerCatalogPages } from "../../libs/sources/onliner_catalog/parse.onliner.catalog.pages";

@Injectable()
@Processor('queueParse')
export class ParseService {
  constructor(
    @InjectQueue('queueScrap')
    private readonly queueScrap: Queue,
    @InjectQueue('queueParse')
    private readonly queueParse: Queue,
    @InjectQueue('queueDbManage')
    private readonly queueDbManage: Queue,
    @Inject(ParseOnlinerCatalogOptions)
    private readonly parseOnlinerCatalogOptions: ParseOnlinerCatalogOptions,
    @Inject(ParseOnlinerCatalogItems)
    private readonly parseOnlinerCatalogItems: ParseOnlinerCatalogItems,
    @Inject(ParseOnlinerCatalogPages)
    private readonly parseOnlinerCatalogPages: ParseOnlinerCatalogPages,
    @Inject(ParseOnlinerCatalogDetail)
    private readonly parseOnlinerCatalogDetail: ParseOnlinerCatalogDetail,
  ) { }

  on(event: string, callback: (job: any, result: any) => void) {
    this.queueParse
      .on(event, (job: any, result: any) => callback(job, result));
  }

  @Process('jobParseOnlinerCatalogOptions')
  async jobParseOnlinerCatalogOptions(job: Job<{ siteId: string, sectionId: string, filePath: string }>) {
    const data = this.parseOnlinerCatalogOptions.run(
      job.data.siteId,
      job.data.sectionId,
      job.data.filePath
    );
    Logger.verbose(`${job.data.siteId} ${job.data.filePath} ${job.data.sectionId} (pid ${process.pid})`, `job_parse`);
    return data;
  }

  @Process('jobParseOnlinerCatalogItems')
  async jobParseOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string, filePath: string, page: number }>) {
    Logger.verbose(`jobParseOnlinerCatalogItems ${job.data.filePath} (pid ${process.pid})`, `job_parse`);
    const data = this.parseOnlinerCatalogItems.run(
      job.data.siteId,
      job.data.sectionId,
      job.data.filePath,
      job.data.page,
    );
    return data;
  }

  @Process('jobParseOnlinerCatalogPages')
  async jobParseOnlinerCatalogPages(job: Job<{ siteId: string, sectionId: string, filePath: string }>) {
    Logger.verbose(`jobParseOnlinerCatalogItems ${job.data.filePath} (pid ${process.pid})`, `job_parse`);
    const data = this.parseOnlinerCatalogPages.run(
      job.data.siteId,
      job.data.sectionId,
      job.data.filePath,
    );
    return data;
  }

  @Process('jobParseOnlinerCatalogDetail')
  async jobParseOnlinerCatalogDetail(job: Job<ParseOnlinerCatalogDetailArgs>) {
    Logger.verbose(`jobParseOnlinerCatalogItems ${job.data.index} of ${job.data.total} ${job.data.filePath} (pid ${process.pid})`, `job_parse`);
    const data = this.parseOnlinerCatalogDetail.run(
      job.data.siteId,
      job.data.sectionId,
      job.data.itemId,
      job.data.filePath,
      job.data.index,
      job.data.total,
    );
    return data;
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`${job.data.siteId} progress ${progress} (pid ${process.pid})`, `job_parse`);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    switch (job.name) {
      case 'jobParseOnlinerCatalogOptions':
        await this.parseOnlinerCatalogOptions.store(
          job.data.siteId,
          job.data.sectionId,
          result.options,
          result.dictionaries,
        );
        this.queueDbManage.add('jobDbManageOnlinerCatalogOptions', {
          siteId: job.data.siteId,
          sectionId: job.data.sectionId,
        });
        break;
      case 'jobParseOnlinerCatalogPages':
        if (result.current < result.last) {
          setTimeout(() => {
            this.queueScrap.add('jobScrapOnlinerCatalogItems', {
              siteId: job.data.siteId,
              sectionId: job.data.sectionId,
              page: result.current + 1,
            });
          }, 3000);
        }
        break;
      case 'jobParseOnlinerCatalogItems':
        await this.parseOnlinerCatalogItems.store(
          job.data.siteId,
          job.data.sectionId,
          result.items
        );
        this.parseOnlinerCatalogItems.removeCachedData(result.filePath);
        this.queueDbManage.add('jobDbManageOnlinerCatalogItems', {
          siteId: result.siteId,
          sectionId: result.sectionId,
          filePath: result.filePath,
          page: result.page,
          items: result.items,
        });
        break;
      case 'ParseOnlinerCatalogDetail':
        break;
    }
    Logger.verbose(`${job.name} completed (pid ${process.pid})`, `job_parse`);
  }
}