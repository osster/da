import { Injectable, Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Site } from "../../../models/site.entity";
import { Section } from "../../../models/sections.entity";
import { Option } from "../../../models/options.entity";
import { Dictionary } from "../../../models/dictionary.entity";
import { OptionDTO } from "../../../http/options/options.dto";
import { OptionsService } from "../../../http/options/options.service";
import { DictionaryDTO } from "../../../http/dictionaries/dictionaries.dto";
import { DictionariesService } from "../../../http/dictionaries/dictionaries.service";

const fs = require('fs');
const path = require('path');

@Injectable()
export class ParseOnlinerCatalogOptions {
    constructor(
        private optionsSrv: OptionsService,
        private dictionariesSrv: DictionariesService,
    ) {}

    public run(siteId: string, sectionId: string, filePath: string) {
        let baseDir = path.join(filePath);
        let data = fs.readFileSync(baseDir);
        const json = JSON.parse(data);
        const options = this.getOptions(json);
        const dictionaries =this.getDictionaries(json);
        fs.unlinkSync(baseDir);
        return {
            siteId,
            sectionId,
            filePath,
            options,
            dictionaries,
        };
    }

    public async store(
        siteId,
        sectionId,
        options: {[key: string]: string}[],
        dictionaries: {[key: string]: any}[],
    ) {
        const optionsData =  (options && options.length)
            ? options.map((o) => {
                return OptionDTO.fill({
                    ...o,
                    site: siteId,
                    sections: [sectionId],
                });
            }) 
            : [];
        if (optionsData.length) {
            const res = await this.optionsSrv.fill(siteId, optionsData);
            Logger.verbose(`Stored ${res[0]} options, updated ${res[1]}.`, 'store');
        }

        const dictionariesData = [];
        if (dictionaries && dictionaries.length) {
            const options = await this.optionsSrv.getByParameterIdIn(siteId, dictionaries.map(d => d.key));
            dictionaries
                .map((d) => {
                    const opt = options.find(o => o.parameter_id === d.key);
                    d.site = siteId;
                    d.option = opt ? opt.id : null;
                    return d;
                })
                .filter(d => d.option !== null)
                .forEach((d) => {
                    if (d.values && d.values.length) { 
                        d.values.forEach((dv) => {
                            dictionariesData.push({
                                key: dv.id,
                                name: dv.name,
                                site: d.site,
                                option: d.option, 
                            });
                        });
                    } else {
                        Logger.error(`dictionary values not found.`, 'scan');
                    }
                });
        }
        if (dictionariesData.length) {
            const res = await this.dictionariesSrv.fill(siteId, dictionariesData);
            Logger.verbose(`Stored ${res[0]} dictionaries, updated ${res[1]}.`, 'store');
        }
    }

    private getOptions(json) {
        const names = [];
        const types = [];
        const optionColumns = [];
        const options = [];
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
        return options;
    }

    private getDictionaries(json) {
        const dictionaries = [];
        Object.keys(json.dictionaries)
            .forEach((k) => {
                dictionaries.push({
                    key: k,
                    values: json.dictionaries[k],
                });
            });
        return dictionaries;
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
            Option,
            Dictionary,
        ]),
    ],
    providers: [
        ParseOnlinerCatalogOptions, OptionsService, DictionariesService,
    ],
    exports: [
        ParseOnlinerCatalogOptions, OptionsService, DictionariesService,
    ]
})
export class ParseOnlinerCatalogOptionsModule {}