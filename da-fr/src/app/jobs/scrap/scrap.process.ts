import { OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { doesNotMatch } from 'assert';
import { Job } from 'bull';
import ScrapOnlinerCatalogQueue from './libs/scrap.onliner';

@Processor('queueScrap')
export class ScrapProcess {
  private filePath: string = '';

  @Process('jobScrapOnliner')
  async jobScrapOnliner(job: Job<{ siteId: string }>) {
    const data = await ScrapOnlinerCatalogQueue();
    Logger.verbose(`${job.data.siteId} (pid ${process.pid})`, `queueScrap`);
    return { filePath: data.file };
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