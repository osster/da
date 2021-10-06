import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { ActionsModule } from './app/http/actions/actions.module';
import { SitesModule } from './app/http/sites/sites.module';
import { OptionsModule } from './app/http/options/options.module';
import { DictionariesModule } from './app/http/dictionaries/dictionaries.module';

@Module({
  imports: [
    ActionsModule,
    DictionariesModule,
    OptionsModule,
    SitesModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    BullModule.forRoot({
      redis: configService.getRedisConfig(),
    }),
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
