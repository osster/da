import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from './../../models/options.entity';
import { OptionsController } from './options.controller';
import { OptionsService } from './options.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Option]),
    ],
    providers: [OptionsService],
    controllers:  [OptionsController],
    exports: [OptionsService],
})
export class OptionsModule {}
