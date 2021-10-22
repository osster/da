import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInstance, IsNumber, IsString, IsUUID } from "class-validator";
import { Site } from "./../../models/site.entity";
import { Section } from "../../models/sections.entity";

export class SectionDTO implements Readonly<SectionDTO> {

    @ApiProperty({ required: true })
    @IsUUID()
    id: string;

    @ApiProperty({ required: true })
    @IsString()
    name: string;

    @ApiProperty({ required: true })
    @IsString()
    uri: string;
  
    @ApiProperty({ required: false })
    @IsString()
    description: string | null;
  
    @ApiProperty({ required: false })
    @IsNumber()
    pages: number;


    @ApiProperty({ required: true })
    @IsInstance(Site)
    site: Site;

    @ApiProperty({ required: true })
    @IsDate()
    created_at: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updated_at: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deleted_at: Date;

    public static fill(dto: Partial<SectionDTO>): SectionDTO {
        const obj = new SectionDTO();
        obj.id = dto.id;
        obj.name = dto.name;
        obj.uri = dto.uri;
        obj.description = dto.description;
        obj.pages = dto.pages;
        obj.site = dto.site;
        obj.created_at = dto.created_at;
        obj.updated_at = dto.updated_at;
        obj.deleted_at = dto.deleted_at;
        return obj;
    }

    public toEntity(): Section {
        const obj = new Section();
        obj.id = this.id;
        obj.name = this.name;
        obj.uri = this.uri;
        obj.description = this.description;
        obj.pages = this.pages;
        obj.site = this.site;
        obj.created_at = this.created_at || new Date();
        obj.updated_at = this.updated_at || new Date();
        obj.deleted_at = this.deleted_at || null;
        return obj;
    }
}