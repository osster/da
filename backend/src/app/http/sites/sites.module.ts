import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './../../models/site.entity';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Site]),
    ],
    providers: [SitesService],
    controllers: [SitesController],
    exports: [SitesService],
})
export class SitesModule {}
