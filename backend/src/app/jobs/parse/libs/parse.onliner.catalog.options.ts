const fs = require('fs');
const path = require('path');

const ParseOnlinerCatalogOptions = async function (args: { siteId: string, sectionId: string, filePath: string }) {
    let baseDir = path.join(args.filePath);
    let data = fs.readFileSync(baseDir);
    const json = JSON.parse(data);
    const names = [];
    const types = [];
    const options = [];
    const dictionaries = [];
    const optionColumns = [];

    Object.keys(json.facets.additional.items)
        .forEach((k) => {
            const name = json.facets.additional.items[k].name;
            const type = json.facets.additional.items[k].type;
            if (!names.includes(name)) {
                names.push(name);
            }
            if (!types.includes(type)) {
                types.push(type);
            }
            Object.keys(json.facets.additional.items[k])
                .forEach(k => {        
                    if (!optionColumns.includes(k)) {
                        optionColumns.push(k);
                    }
                });
            options.push(json.facets.additional.items[k]);
        });
    Object.keys(json.facets.general.items)
        .forEach((k) => {
            const name = json.facets.general.items[k].name;
            const type = json.facets.general.items[k].type;
            if (!names.includes(name)) {
                names.push(name);
            }
            if (!types.includes(type)) {
                types.push(type);
            }
            Object.keys(json.facets.general.items[k])
                .forEach(k => {        
                    if (!optionColumns.includes(k)) {
                        optionColumns.push(k);
                    }
                });
            options.push(json.facets.additional.items[k]);
        });

    Object.keys(json.dictionaries)
        .forEach((k) => {
            dictionaries.push({
                key: k,
                values: json.dictionaries[k],
            });
        });
    
    fs.unlinkSync(baseDir);

    return {
        siteId: args.siteId,
        sectionId: args.sectionId,
        filePath: args.filePath,
        options,
        dictionaries,
    };
};

export default ParseOnlinerCatalogOptions;