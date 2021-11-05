import { Injectable, Logger, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Site } from "../../../models/site.entity";
import { Section } from "../../../models/sections.entity";
import { Option, OptionType } from "../../../models/options.entity";
import { Dictionary } from "../../../models/dictionaries.entity";
import { Group } from "../../../models/groups.entity";
import { OptionsService } from "../../../http/options/options.service";
import { DictionariesService } from "../../../http/dictionaries/dictionaries.service";
import { DictionaryItem } from "../../../models/dictionary_items.entity";
import { Connection, getConnection, In, Repository } from "typeorm";

const fs = require('fs');
const path = require('path');

@Injectable()
export class ParseOnlinerCatalogOptions {
    constructor(
        private optionsSrv: OptionsService,
        private dictionariesSrv: DictionariesService,
        @InjectRepository(Site)
        private readonly siteRepo: Repository<Site>,
        @InjectRepository(Section)
        private readonly sectionRepo: Repository<Section>,
        @InjectRepository(Dictionary)
        private readonly dictionaryRepo: Repository<Dictionary>,
        @InjectRepository(DictionaryItem)
        private readonly dictionaryItemRepo: Repository<DictionaryItem>,
        @InjectRepository(Group)
        private readonly groupRepo: Repository<Group>,
        @InjectRepository(Option)
        private readonly optionRepo: Repository<Option>,
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
        const siteObj = await this.siteRepo.findOneOrFail(siteId);
        const sectionObj = await this.sectionRepo.findOneOrFail({
            where: {
                id: sectionId
            },
            relations: ['groups'],
        });
        
        // Dictionaries
        let itemsCount = 0;
        let addedToDefaultGroupOptionsCount = 0;
        for(const dictionary of dictionaries) {
            let dictionaryObj = await this.dictionaryRepo.findOne({
                where: {
                    site: siteObj,
                    key: dictionary.key
                }
            });
            if (!dictionaryObj) {
                dictionaryObj = await this.dictionaryRepo.save({
                    site: siteObj,
                    key: dictionary.key,
                    name: dictionary.key,
                });
            }
            for (const dictionaryItem of dictionary.values) {
                let dictionaryItemObj = await this.dictionaryItemRepo.findOne({
                    where: {
                        dictionary: dictionaryObj,
                        key: dictionaryItem.id
                    }
                });
                if (!dictionaryItemObj) {
                    dictionaryItemObj = await this.dictionaryItemRepo.save({
                        dictionary: dictionaryObj,
                        key: dictionaryItem.id,
                        name: dictionaryItem.name.replace(/&quot;/g, '"'),
                    });
                    itemsCount++;
                }
            }
        }
        Logger.verbose(`Stored ${itemsCount} items at ${dictionaries.length} dictionaries.`, 'store_options');

        let optionsCount = 0;
        for (const option of options) {
            const dictionaryObj = await this.getDictionary(siteObj, option);

            let optionObj = await this.optionRepo.findOne({
                where: {
                    parameter_id: option.parameter_id,
                },
            });
            if (!optionObj) {
                let type;
                switch (option.type) {
                    case 'boolean':
                        type = OptionType.BOOL;
                        break;
                    case 'dictionary':
                        type = OptionType.DICTIONARY;
                        break;
                    case 'dictionary_range':
                        type = OptionType.DICTIONARY_RANGE;
                        break;
                    case 'number_range':
                        type = OptionType.NUMBER_RANGE;
                        break;
                }
                optionObj = await this.optionRepo.save({
                    name: option.name,
                    description: option.description,
                    type,
                    parameter_id: option.parameter_id,
                    dictionary: dictionaryObj,
                    bool_type: option.bool_type,
                    unit: option.unit,
                    ratio: !!option.ratio ? parseInt(option.ratio) : null,
                    operation: option.operation,
                });
                optionsCount++;
            }

            const defaultGroupObj = await this.getOrCreateDefaultGroup(siteObj, sectionObj);
            if (defaultGroupObj && defaultGroupObj.options.filter(o => o.id === optionObj.id).length === 0) {
                defaultGroupObj.options.push(optionObj);
                const connection: Connection = getConnection();
                connection.manager.save(defaultGroupObj);
                addedToDefaultGroupOptionsCount++;
            }
            optionObj = undefined;
        }
        Logger.verbose(`Stored ${optionsCount} options, added to default group ${addedToDefaultGroupOptionsCount}.`, 'store_options');
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
        dictionaries.map(d => {
            d.values.map(v => ({
                id: v.id,
                name: v.name.trim(),
            }));
        });
        return dictionaries;
    }

    private async getOrCreateDefaultGroup(siteObj: Site, sectionObj: Section): Promise<Group> {
        let defaultGroup = await this.groupRepo.findOne({
            where: {
                site: siteObj,
                name: 'Default',
            },
            relations: ['options']
        });
        if (!defaultGroup) {
            defaultGroup = await this.groupRepo.save({
                site: siteObj,
                name: 'Default',
            });
            sectionObj.groups.push(defaultGroup);
            const connection: Connection = getConnection();
            connection.manager.save(sectionObj);
        }
        defaultGroup = await this.groupRepo.findOne({
            where: {
                site: siteObj,
                name: 'Default',
            },
            relations: ['options']
        });
        return defaultGroup;
    }

    private async getDictionary(siteObj: Site, option: {[key: string]: any}): Promise<Dictionary | null> {
        return !!option.dictionary_id 
        ? await this.dictionaryRepo.findOne({
            where: { 
                site: siteObj,
                key: option.dictionary_id
            }
        }) : null;
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Site,
            Section,
            Group,
            Option,
            Dictionary,
            DictionaryItem,
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