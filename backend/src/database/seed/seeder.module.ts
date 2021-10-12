import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configService } from "src/config/config.service";
import { Seeder } from "./seeder";
import { Section } from "src/app/models/sections.entity";
import { Site } from "src/app/models/site.entity";
import { SectionSeederService } from "./sections/sections.seeder.service";
import { SiteSeederService } from "./sites/sites.seeder.service";

/**
 * Import and provide seeder classes.
 *
 * @module
 */
 @Module({
    imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([Site, Section]),
    ],
    providers: [
        Logger,
        Seeder,
        SiteSeederService,
        SectionSeederService,
    ],
    exports: [
        SiteSeederService,
        SectionSeederService,
    ],
  })
  export class SeederModule {}