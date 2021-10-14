import { Logger } from "@nestjs/common";

const fs = require('fs');
const path = require('path');

export interface ParsedOnlinerCatalogItem {
    _id: string,
    key: string,
    name: string,
    full_name: string,
    name_prefix: string,
    images: string[],
    description: string,
    micro_description: string,
    html_url: string,
    url: string,
};

const ParseOnlinerCatalogItems = async function (args: { siteId: string, sectionId: string, filePath: string, page: number }) {
    let baseDir = path.join(args.filePath);
    let data = fs.readFileSync(baseDir);
    const json = JSON.parse(data);
    const items = [];
    const pages = {
        current: 1,
        items: 30,
        last: 1,
        limit: 30,
    }

    if (json && json.products) {
        try {
            Object.keys(json.products)
                .forEach((k) => {
                    const p = json.products[k];
                    if (p) {
                        items.push({
                            _id: p.id,
                            key: p.key,
                            name: p.name,
                            full_name: p.full_name,
                            name_prefix: p.name_prefix,
                            images: p.images && p.images.header ? [p.images.header] : [],
                            description: p.description,
                            micro_description: p.micro_description,
                            html_url: p.html_url,
                            url: p.url,
                        });
                    } else {
                        Logger.error(`Product ${k} not found.`, 'queue_parse');
                        console.log('json', json);
                    }
                });
        } catch (e) {
            Logger.error('Parsing Onliner catalog items fails.', 'queue_parse');
            console.error(e);
        }
    } else {
        Logger.error(`Parsing Onliner catalog items JSON not found.`, 'queue_parse');
    }

    if (json && json.page) {
        pages.current = json.page.current;
        pages.items = json.page.items;
        pages.last = json.page.last;
        pages.limit = json.page.limit;
    }
    
    //fs.unlinkSync(baseDir);

    return {
        siteId: args.siteId,
        sectionId: args.sectionId,
        filePath: args.filePath,
        page: args.page,
        items,
        pages,
    };
};

export default ParseOnlinerCatalogItems;