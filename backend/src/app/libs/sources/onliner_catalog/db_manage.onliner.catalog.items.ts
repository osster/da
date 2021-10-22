import { Logger, Module } from "@nestjs/common";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { Site } from "../../../models/site.entity";
// import { Section } from "../../../models/sections.entity";
import { ParsedOnlinerCatalogItem } from "./parse.onliner.catalog.items";

export class DbManageOnlinerCatalogItems {

    constructor () {}

    public async run(siteId: string, sectionId: string, items: ParsedOnlinerCatalogItem[]) {
        // Logger.debug(`DbManageOnlinerCatalogItems run ${siteId}, ${sectionId}, ${items.length}`, 'job_dbmanage_items');
    }
};

@Module({
    imports: [
        // TypeOrmModule.forFeature([
        //     Site,
        //     Section,
        // ]),
    ],
    providers: [
        DbManageOnlinerCatalogItems,
    ],
    exports: [
        DbManageOnlinerCatalogItems,
    ]
})
export class DbManageOnlinerCatalogItemsModule {}