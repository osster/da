import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { configService } from '../../../config/config.service';
import { ScrapProcess } from '../../jobs/scrap/scrap.process';
import { ScrapService } from '../../jobs/scrap/scrap.service';
import { ParseProcess } from '../../jobs/parse/parse.process';
import { ParseService } from '../../jobs/parse/parse.service';
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

@Module({
    imports: [
        SitesModule,
        // OptionsModule,
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
        ScrapProcess,
        ParseService,
        ParseProcess,
        OptionsService,
        DictionariesService,
    ],
    controllers: [ActionsController],
    exports: [
        ActionsService,
        ScrapService,
        ScrapProcess,
        ParseService,
        ParseProcess,
        OptionsService,
        DictionariesService,
    ],
})
export class ActionsModule {}
