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
            const url = `https://${args.site.host}${s.uri}`;
            const sectionIds = args.sections.map(i => i.id);
            // console.log('jobScrapOnliner options', {
            //     siteId: args.site.id,
            //     sectionId: s.id,
            //     url,
            // });
            this.queueScrap.add('jobScrapOnliner', { 
                siteId: args.site.id,
                sectionId: s.id,
                url,
             });
        });
    }
}