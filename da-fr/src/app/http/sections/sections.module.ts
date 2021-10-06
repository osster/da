import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from '../../models/sections.entity';
import { Site } from '../../models/site.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Section, Site]),
  ],
  providers: [SectionsService],
  controllers: [SectionsController],
  exports: [SectionsService],
})
export class SectionsModule {}
