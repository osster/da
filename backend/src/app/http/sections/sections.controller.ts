import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { SectionDTO } from './sections.dto';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
    constructor(private srv: SectionsService) {}
    
    @Get(':site_id')
    public async index(@Param('site_id') siteId: string): Promise<SectionDTO[]> {
        try {
            return await this.srv.getAll(siteId);
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Section not found',
              }, HttpStatus.NOT_FOUND);
        }
    }

    @Post(':site_id')
    public async create(
        @Param('site_id') siteId: string,
        @Body() dto: SectionDTO
    ): Promise<SectionDTO> {
        return this.srv.create(siteId, dto);
    }
}
