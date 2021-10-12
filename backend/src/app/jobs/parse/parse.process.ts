import { OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import ParseOnlinerCatalogQueue from './libs/parse.onliner';

@Processor('queueParse')
export class ParseProcess {
  @Process('jobParseOnliner')
  async jobParseOnliner(job: Job<{ siteId: string, sectionId: string, filePath: string }>) {
    const data = await ParseOnlinerCatalogQueue({ file: job.data.filePath })
    Logger.verbose(`${job.data.siteId} ${job.data.filePath} ${job.data.sectionId} (pid ${process.pid})`, `queueParse`);
    return  {
      siteId: job.data.siteId,
      sectionId: job.data.sectionId,
      filePath: data.file,
      options: data.options,
      dictionaries: data.dictionaries
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