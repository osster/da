import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { OptionDTO } from './options.dto';
import { OptionsService } from './options.service';

@Controller('options')
export class OptionsController {
    constructor(private srv: OptionsService) {}
    
    @Get(':site_id')
    public async index(@Param('site_id') siteId: string): Promise<OptionDTO[]> {
        try {
            return await this.srv.getAll(siteId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Options not found',
              }, HttpStatus.NOT_FOUND);
        }
    }
}
