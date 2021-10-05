import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsModule } from './app/http/actions/actions.module';
import { SitesModule } from './app/http/sites/sites.module';
import { OptionsModule } from './app/http/options/options.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ActionsModule,
    SitesModule,
    OptionsModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    BullModule.forRoot({
      redis: configService.getRedisConfig(),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
