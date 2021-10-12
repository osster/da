import { OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { doesNotMatch } from 'assert';
import { Job } from 'bull';
import ScrapOnlinerCatalogQueue from './libs/scrap.onliner';

@Processor('queueScrap')
export class ScrapProcess {
  @Process('jobScrapOnliner')
  async jobScrapOnliner(job: Job<{ siteId: string, sectionId: string, url: string }>) {
    const data = await ScrapOnlinerCatalogQueue(job.data.siteId, job.data.sectionId, job.data.url);
    Logger.verbose(`${job.data.siteId} (pid ${process.pid})`, `queueScrap`);
    return {
      siteId: data.siteId,
      sectionId: data.sectionId,
      url: data.url,
      filePath: data.file,
      t: data.t
    };
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`${job.data.siteId} (pid ${process.pid})`, `progress ${progress}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    Logger.verbose(`${job.data.siteId} (pid ${process.pid})`, `completed`);
  }
}