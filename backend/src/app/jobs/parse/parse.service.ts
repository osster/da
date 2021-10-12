import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class ParseService {
    constructor(
        @InjectQueue('queueParse') private readonly queueParse: Queue,
    ) {}

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueParse
            .on(event, (job: any, result: any) => callback(job, result));
    }

    async jobParseOnliner(args) {
        return await this.queueParse.add('jobParseOnliner', {
            siteId: args.siteId,
            sectionId: args.sectionId,
            filePath: args.filePath
        });
    }
}