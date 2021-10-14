import { OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import ScrapOnlinerCatalogOptionsQueue from './libs/scrap.onliner.catalog.options';
import ScrapOnlinerCatalogItemsQueue from './libs/scrap.onliner.catalog.items';

@Processor('queueScrap')
export class ScrapProcess {
  @Process('jobScrapOnlinerCatalogOptions')
  async jobScrapOnlinerCatalogOptions(job: Job<{ siteId: string, sectionId: string, url: string }>) {
    const data = await ScrapOnlinerCatalogOptionsQueue(job.data.siteId, job.data.sectionId, job.data.url);
    Logger.verbose(`${job.data.siteId} (pid ${process.pid})`, `queue_scrap_options`);
    return data;
  }
  @Process('jobScrapOnlinerCatalogItems')
  async jobScrapOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string, url: string, page: number }>) {
    const data = await ScrapOnlinerCatalogItemsQueue(job.data.siteId, job.data.sectionId, job.data.url, job.data.page);
    Logger.verbose(`${job.data.siteId} page ${data.page} (pid ${process.pid})`, `queue_scrap_items`);
    return data;
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`${job.data.siteId} progress ${progress} (pid ${process.pid})`, `queue_scrap`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    Logger.verbose(`${job.data.siteId} page ${result.page} completed (pid ${process.pid})`, `queue_scrap`);
  }
}