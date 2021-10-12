import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { DictionaryDTO } from './dictionaries.dto';
import { DictionariesService } from './dictionaries.service';

@Controller('dictionaries')
export class DictionariesController {
    constructor(private srv: DictionariesService) {}
    
    @Get(':site_id')
    public async index(@Param('site_id') siteId: string): Promise<DictionaryDTO[]> {
        try {
            return await this.srv.getAll(siteId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Dictionaries not found',
              }, HttpStatus.NOT_FOUND);
        }
    }
}
