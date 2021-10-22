import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dictionary } from '../../models/dictionaries.entity';
import { DictionariesController } from './dictionaries.controller';
import { DictionariesService } from './dictionaries.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dictionary]),
    ],
    providers: [DictionariesService],
    controllers:  [DictionariesController],
    exports: [DictionariesService],
})
export class DictionariesModule {}
