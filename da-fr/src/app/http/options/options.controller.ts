import { Controller, Get } from '@nestjs/common';
import { OptionDTO } from './options.dto';
import { OptionsService } from './options.service';

@Controller('options')
export class OptionsController {
    constructor(private srv: OptionsService) {}
    
    @Get()
    public async index(): Promise<OptionDTO[]> {
        return await this.srv.getAll('6482840c-19aa-40f1-8c5c-e91e0e2184d8');
    }
}
