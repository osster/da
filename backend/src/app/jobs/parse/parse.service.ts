import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class ParseService {
    constructor(
        @InjectQueue('queueParse')
        private readonly queueParse: Queue,
    ) {}

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueParse
            .on(event, (job: any, result: any) => callback(job, result));
    }

    async jobParseOnlinerCatalogOptions(args) {
        return await this.queueParse.add('jobParseOnlinerCatalogOptions', {
            siteId: args.siteId,
            sectionId: args.sectionId,
            filePath: args.filePath
        });
    }

    async jobParseOnlinerCatalogItems(args) {
        return await this.queueParse.add('jobParseOnlinerCatalogItems', {
            siteId: args.siteId,
            sectionId: args.sectionId,
            filePath: args.filePath,
            page: args.page
        });
    }
}