import { Module } from "@nestjs/common";
import { ScrapOnlinerCatalogOptions } from "../../libs/sources/onliner_catalog/scrap.onliner.catalog.options";
import { ScrapOnlinerCatalogItems } from "../../libs/sources/onliner_catalog/scrap.onliner.catalog.items";
import { ScrapService } from "./scrap.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Site } from "../../models/site.entity";
import { Section } from "../../models/sections.entity";

@Module({
    imports: [
        ScrapOnlinerCatalogOptions,
        ScrapOnlinerCatalogItems,
        TypeOrmModule.forFeature([
            Site,
            Section,
        ]),
    ],
    providers: [ScrapService],
    exports: [ScrapService],
})
export class ScrapModule {}