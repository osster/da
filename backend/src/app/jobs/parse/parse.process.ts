import { OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import ParseOnlinerCatalogItems from './libs/parse.onliner.catalog.items';
import ParseOnlinerCatalogOptions from './libs/parse.onliner.catalog.options';

@Processor('queueParse')
export class ParseProcess {
  @Process('jobParseOnlinerCatalogOptions')
  async jobParseOnlinerCatalogOptions(job: Job<{ siteId: string, sectionId: string, filePath: string }>) {
    const data = await ParseOnlinerCatalogOptions({ siteId: job.data.siteId, sectionId: job.data.sectionId, filePath: job.data.filePath })
    Logger.verbose(`${job.data.siteId} ${job.data.filePath} ${job.data.sectionId} (pid ${process.pid})`, `queue_parse`);
    return  data;
  }
  
  @Process('jobParseOnlinerCatalogItems')
  async jobParseOnlinerCatalogItems(job: Job<{ siteId: string, sectionId: string, filePath: string, page: number }>) {
    Logger.verbose(`jobParseOnlinerCatalogItems ${job.data.filePath} (pid ${process.pid})`, `queue_parse`);
    const data = await ParseOnlinerCatalogItems({ 
      siteId: job.data.siteId,
      sectionId: job.data.sectionId, 
      filePath: job.data.filePath, 
      page: job.data.page,
    });
    return  data;
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    Logger.verbose(`${job.data.siteId} progress ${progress} (pid ${process.pid})`, `queue_parse`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    Logger.verbose(`${job.data.siteId} completed (pid ${process.pid})`, `queue_parse`);
  }
}