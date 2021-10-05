import { NestFactory } from "@nestjs/core";
import { OptionsService } from "../../../http/options/options.service";
import { AppModule } from "../../../../app.module";
import { Job } from "bull";

const Queue = require('bull');
const fs = require('fs');
const path = require('path');

const ParseOnlinerCatalogQueue = async function (args) {
    let baseDir = path.join(args.file);
    let data = fs.readFileSync(baseDir);
    const json = JSON.parse(data);
    const names = [];
    const types = [];
    const options = [];
    const optionColumns = [];
    const SkipColumns = [
        'max_count',
        'predefined_ranges',
        'disabled_description',
        'popular_dictionary_values',
        'segment_related_name',
    ];


    // const context = await NestFactory.createApplicationContext(AppModule);
    // const optionsService = context.get(OptionsService);
    // const optionsExist = await optionsService.getAll('6482840c-19aa-40f1-8c5c-e91e0e2184d8');

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
    // console.log({ types: JSON.stringify(names, null, 2) });
    // console.log({ types: JSON.stringify(types, null, 2) });
    // console.log({ optionColumns: JSON.stringify(optionColumns, null, 2) });
    console.log({ file: args.file, optionsCount: options.length });
    // console.log({ optionsExist: optionsService });
    return {
         t: new Date(),
        file: args.file,
        options,
    };
};

export default ParseOnlinerCatalogQueue;