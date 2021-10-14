import { getJson, storeJson } from '../../../helpers/parser.helpers';

const ScrapOnlinerCatalogItemsQueue = async function (siteId: string, sectionId: string, url: string, page: number) {
    const json = await getJson(url);
    const filePath = storeJson(json, `${page}_onliner_catalog_items`);
    return { 
        siteId,
        sectionId,
        url,
        page,
        filePath,
    };
};

export default ScrapOnlinerCatalogItemsQueue;