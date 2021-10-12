import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SiteDTO } from "src/app/http/sites/sites.dto";
import { Site } from "src/app/models/site.entity";
import { Repository } from "typeorm";
import { sitesData } from "./sites.data";

/**
 * Service dealing with language based operations.
 *
 * @class
 */
@Injectable()
export class SiteSeederService {
    private sites: SiteDTO[];
    /**
    * Create an instance of class.
    *
    * @constructs
    *
    * @param {Repository<Site>} siteRepository
    */
    constructor(
        @InjectRepository(Site)
        private readonly siteRepository: Repository<Site>,
    ) {
        this.sites = sitesData;
    }

    /**
    * Seed all items.
    *
    * @function
    */
    create(): Array<Promise<Site>> {
        return this.sites.map(async (site: SiteDTO) => {
            return await this.siteRepository
                .findOne({ type: site.type })
                // .exec()
                .then(async dbItem => {
                    // We check if a site already exists.
                    // If it does don't create a new one.
                    if (dbItem) {
                        return Promise.resolve(null);
                    }
                    return Promise.resolve(
                        await this.siteRepository.save(site),
                    );
                })
                .catch(error => Promise.reject(error));
        });
   }
 }