import { Injectable, Logger } from "@nestjs/common";
import { SectionSeederService } from "./sections/sections.seeder.service";
import { SiteSeederService } from "./sites/sites.seeder.service";

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly sitesSeederService: SiteSeederService,
    private readonly sectionSeederService: SectionSeederService,
  ) {}
  async seed() {
    await this.sites()
        .then(completed => {
            this.logger.debug('Successfuly completed seeding sites...');
            Promise.resolve(completed);
        })
        .catch(error => {
            this.logger.error('Failed seeding sites...');
            Promise.reject(error);
        });
    await this.sections()
        .then(completed => {
            this.logger.debug('Successfuly completed seeding sections...');
            Promise.resolve(completed);
        })
        .catch(error => {
            this.logger.error('Failed seeding sections...');
            Promise.reject(error);
        });
  }
  async sites() {
    return await Promise.all(this.sitesSeederService.create())
      .then(createdSites => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of sites created : ' +
            // Remove all null values and return only created sites.
            createdSites.filter(
              nullValueOrCreatedSite => nullValueOrCreatedSite,
            ).length,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }
  async sections() {
    return await Promise.all(this.sectionSeederService.create())
      .then(createdSections => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of sections created : ' +
            // Remove all null values and return only created sections.
            createdSections.filter(
              nullValueOrCreatedSection => nullValueOrCreatedSection,
            ).length,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }
}