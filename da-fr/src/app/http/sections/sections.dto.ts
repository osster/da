import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInstance, IsString, IsUUID } from "class-validator";
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


    @ApiProperty({ required: true })
    @IsInstance(Site)
    site: Site;

    @ApiProperty({ required: true })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updatedAt: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deletedAt: Date;

    public static fill(dto: Partial<SectionDTO>): SectionDTO {
        const obj = new SectionDTO();
        obj.id = dto.id;
        obj.name = dto.name;
        obj.uri = dto.uri;
        obj.description = dto.description;
        obj.site = dto.site;
        obj.createdAt = dto.createdAt;
        obj.updatedAt = dto.updatedAt;
        obj.deletedAt = dto.deletedAt;
        return obj;
    }

    public toEntity(): Section {
        const obj = new Section();
        obj.id = this.id;
        obj.name = this.name;
        obj.uri = this.uri;
        obj.description = this.description;
        obj.site = this.site;
        obj.createdAt = this.createdAt || new Date();
        obj.updatedAt = this.updatedAt || new Date();
        obj.deletedAt = this.deletedAt || null;
        return obj;
    }
}