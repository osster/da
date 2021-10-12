import { SectionDTO } from "src/app/http/sections/sections.dto";
import { SiteDTO } from "src/app/http/sites/sites.dto";
import { Site, SiteType } from "src/app/models/site.entity";


export const sectionsData = function(sites: Site[]): SectionDTO[] {
    const catalogOnlinerSite: Site = sites.find(s => s.type === SiteType.CATALOG_ONLINER_BY);
    return [
    SectionDTO.fill({
        site: catalogOnlinerSite,
        name: 'Onliner Mobile Catalog',
        uri: '/mobile',
        description: '',
    }),
    SectionDTO.fill({
        site: catalogOnlinerSite,
        name: 'Onliner Smartwatch Catalog',
        uri: '/smartwatch',
        description: '',
    }),
  ];
};