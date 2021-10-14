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

    async jobScrapOnlinerCatalogOptions(args: {site: SiteDTO, sections: SectionDTO[]}) {
        args.sections.forEach((s) => {
            // Scrap options
            const optionsUrl = `https://${args.site.host}/sdapi/catalog.api/facets${s.uri}`;
            this.queueScrap.add('jobScrapOnlinerCatalogOptions', { 
                siteId: args.site.id,
                sectionId: s.id,
                url: optionsUrl,
             });
        });
    }

    async jobScrapOnlinerCatalogItems(args: {site: SiteDTO, section: SectionDTO, page: number}) {
        // Scrap items
        const itemsUrl = `https://${args.site.host}/sdapi/catalog.api/search${args.section.uri}?group=1&page=${args.page}`;
        return await this.queueScrap.add('jobScrapOnlinerCatalogItems', { 
            siteId: args.site.id,
            sectionId: args.section.id,
            url: itemsUrl,
            page: args.page,
         });
    }
}