import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { SectionDTO } from "../../http/sections/sections.dto";
import { SiteDTO } from "../../http/sites/sites.dto";

@Injectable()
export class ScrapService {
    constructor(
        @InjectQueue('queueScrap') private readonly queueScrap: Queue,
    ) {}

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueScrap
            .on(event, (job: any, result: any) => callback(job, result));
    }

    async jobScrapOnliner(args: {site: SiteDTO, sections: SectionDTO[]}) {
        args.sections.forEach((s) => {
            // Scrap options
            const optionsUrl = `https://${args.site.host}/sdapi/catalog.api/facets${s.uri}`;
            this.queueScrap.add('jobScrapOnliner', { 
                siteId: args.site.id,
                sectionId: s.id,
                url: optionsUrl,
             });
        });
    }
}