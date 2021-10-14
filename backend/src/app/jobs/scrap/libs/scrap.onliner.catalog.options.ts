import { getJson, storeJson } from '../../../helpers/parser.helpers';

const ScrapOnlinerCatalogOptionsQueue = async function (siteId: string, sectionId: string, url: string) {
    const json = await getJson(url);
    const filePath = storeJson(json, 'onliner_catalog_options');
    return {
        siteId,
        sectionId,
        url,
        filePath
    };
};

export default ScrapOnlinerCatalogOptionsQueue;