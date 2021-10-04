import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SiteDTO } from './sites.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
    constructor(private srv: SitesService) {}

    @Get()
    public async index(): Promise<SiteDTO[]> {
        return await this.srv.getAll();
    }

    @Post()
    public async create(
        @Body() dto: SiteDTO
    ): Promise<SiteDTO> {
        return this.srv.create(dto);
    }

    @Patch(':id')
    public async update(
        @Param('id') id: string,
        @Body() dto: SiteDTO
    ): Promise<SiteDTO> {
        return this.srv.update(id, dto);
    }

    @Delete(':id') 
    public async delete(
        @Param('id') id: string
    ): Promise<Boolean> {
        return this.srv.delete(id);
    }

}
