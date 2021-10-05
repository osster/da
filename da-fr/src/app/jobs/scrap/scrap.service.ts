import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class ScrapService {
    constructor(
        @InjectQueue('queueScrap') private readonly queueScrap: Queue,
    ) {}

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueScrap
            .on(event, (job: any, result: any) => callback(job, result));
    }

    async jobScrapOnliner(site_id) {
        return await this.queueScrap.add('jobScrapOnliner', { siteId: site_id });
    }
}