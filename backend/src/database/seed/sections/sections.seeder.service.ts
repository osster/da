import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SectionDTO } from "src/app/http/sections/sections.dto";
import { Section } from "src/app/models/sections.entity";
import { Site } from "src/app/models/site.entity";
import { Repository } from "typeorm";
import { sectionsData } from "./sections.data";

/**
 * Service dealing with language based operations.
 *
 * @class
 */
@Injectable()
export class SectionSeederService {
    private sites: Site[];
    private sections: SectionDTO[];
    /**
    * Create an instance of class.
    *
    * @constructs
    *
    * @param {Repository<Site>} siteRepository
    * @param {Repository<Section>} sectionRepository
    */
    constructor(
        @InjectRepository(Site)
        private readonly siteRepository: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) {
        this.siteRepository.find().then(sites => this.sites = sites);
    }

    /**
    * Seed all items.
    *
    * @function
    */
    create(): Array<Promise<Site>> {
        this.sections = sectionsData(this.sites);
        return this.sections.map(async (section: any) => {
            return await this.sectionRepository
                .findOne({ name: section.name })
                // .exec()
                .then(async dbItem => {
                    // We check if a site already exists.
                    // If it does don't create a new one.
                    if (dbItem) {
                        return Promise.resolve(null);
                    }
                    return Promise.resolve(
                        await this.sectionRepository.save(section),
                    );
                })
                .catch(error => Promise.reject(error));
        });
   }
 }