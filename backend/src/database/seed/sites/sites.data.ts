import { SiteDTO } from "src/app/http/sites/sites.dto";
import { SiteType } from "src/app/models/site.entity";

export const sitesData: SiteDTO[] = [
    SiteDTO.fill({
        name: 'Onliner Catalog',
        description: '',
        host: 'catalog.onliner.by',
        type: SiteType.CATALOG_ONLINER_BY
    }),
    SiteDTO.fill({
        name: 'Onliner Auto',
        description: '',
        host: 'ab.onliner.by',
        type: SiteType.AB_ONLINER_BY
    }),
    SiteDTO.fill({
        name: 'Onliner Realt',
        description: '',
        host: 'r.onliner.by',
        type: SiteType.R_ONLINER_BY
    }),
  ];