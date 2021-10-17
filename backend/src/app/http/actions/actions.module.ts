import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { configService } from '../../../config/config.service';
import { ScrapService } from '../../jobs/scrap/scrap.service';
import { ParseService } from '../../jobs/parse/parse.service';
import { DbManageService } from '../../jobs/db_manage/db_manage.service';
import { SitesModule } from '../sites/sites.module';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { OptionsService } from '../options/options.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from '../../models/options.entity';
import { DictionariesService } from '../dictionaries/dictionaries.service';
import { Dictionary } from '../../models/dictionary.entity';
import { Site } from '../../models/site.entity';
import { Section } from '../../models/sections.entity';
import { SectionsModule } from '../sections/sections.module';
import { OptionsModule } from '../options/options.module';
import { ScrapOnlinerCatalogOptionsModule } from '../../libs/sources/onliner_catalog/scrap.onliner.catalog.options';
import { ScrapOnlinerCatalogItemsModule } from '../../libs/sources/onliner_catalog/scrap.onliner.catalog.items';
import { ParseOnlinerCatalogOptionsModule } from '../../libs/sources/onliner_catalog/parse.onliner.catalog.options';
import { ParseOnlinerCatalogItemsModule } from '../../libs/sources/onliner_catalog/parse.onliner.catalog.items';
import { ParseOnlinerCatalogPagesModule } from '../../libs/sources/onliner_catalog/parse.onliner.catalog.pages';
import { DbManageOnlinerCatalogItemsModule } from '../../libs/sources/onliner_catalog/db_manage.onliner.catalog.items';

@Module({
    imports: [
        SitesModule,
        SectionsModule,
        OptionsModule,
        ScrapOnlinerCatalogOptionsModule,
        ScrapOnlinerCatalogItemsModule,
        ParseOnlinerCatalogOptionsModule,
        ParseOnlinerCatalogItemsModule,
        ParseOnlinerCatalogPagesModule,
        DbManageOnlinerCatalogItemsModule,
        BullModule.registerQueueAsync({
            name: 'queueScrap',
            useFactory: async () => ({
                name: 'queueScrap',
                redis: configService.getRedisConfig(),
                prefix: 'da',
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: true,
                },
                settings: {
                    lockDuration: 300000,
                },
            })
        }),
        BullModule.registerQueueAsync({
            name: 'queueParse',
            useFactory: async () => ({
                name: 'queueParse',
                redis: configService.getRedisConfig(),
                prefix: 'da',
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: true,
                },
                settings: {
                    lockDuration: 300000,
                },
            })
        }),
        BullModule.registerQueueAsync({
            name: 'queueDbManage',
            useFactory: async () => ({
                name: 'queueDbManage',
                redis: configService.getRedisConfig(),
                prefix: 'da',
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: true,
                },
                settings: {
                    lockDuration: 300000,
                },
            })
        }),
        TypeOrmModule.forFeature([
            Site,
            Section,
            Option,
            Dictionary,
        ]),
    ],
    providers: [
        ActionsService,
        ScrapService,
        ParseService,
        DbManageService,
        OptionsService,
        DictionariesService,
    ],
    controllers: [ActionsController],
    exports: [
        ActionsService,
        ScrapService,
        ParseService,
        DbManageService,
        OptionsService,
        DictionariesService,
    ],
})
export class ActionsModule {}
