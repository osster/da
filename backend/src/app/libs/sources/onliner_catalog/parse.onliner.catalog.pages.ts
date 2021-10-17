import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Section } from "../../../models/sections.entity";
import { Site } from "../../../models/site.entity";

const fs = require('fs');
const path = require('path');

export interface ParsedOnlinerCatalogPage {
    current: number,
    items: number,
    last: number,
    limit: number,
};

export class ParseOnlinerCatalogPages {
    constructor() {}

    public run(siteId: string, sectionId: string, filePath: string): ParsedOnlinerCatalogPage {
        let baseDir = path.join(filePath);
        let data = fs.readFileSync(baseDir);
        const json = JSON.parse(data);
        const pages = {
            current: 1,
            items: 30,
            last: 1,
            limit: 30,
        }
    
        if (json && json.page) {
            pages.current = json.page.current;
            pages.items = json.page.items;
            pages.last = json.page.last;
            pages.limit = json.page.limit;
        }
    
        return pages;
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
        ]),
    ],
    providers: [
        ParseOnlinerCatalogPages,
    ],
    exports: [
        ParseOnlinerCatalogPages,
    ]
})
export class ParseOnlinerCatalogPagesModule {}
