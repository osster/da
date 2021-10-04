import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsDate, } from 'class-validator';
import { Site } from "../models/site.entity";

export class SiteDTO implements Readonly<SiteDTO> {

    @ApiProperty({ required: true })
    @IsUUID()
    id: string;

    @ApiProperty({ required: true })
    @IsString()
    name: string;

    @ApiProperty({ required: true })
    @IsString()
    host: string;

    @ApiProperty({ required: false })
    @IsString()
    description: string;

    @ApiProperty({ required: true })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updatedAt: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deletedAt: Date;

    public static fill(dto: Partial<SiteDTO>): SiteDTO {
        const obj = new SiteDTO();
        obj.id = dto.id;
        obj.name = dto.name;
        obj.host = dto.host;
        obj.description = dto.description;
        obj.createdAt = dto.createdAt;
        obj.updatedAt = dto.updatedAt;
        obj.deletedAt = dto.deletedAt;
        return obj;
    }

    public toEntity(): Site {
        const obj = new Site();
        obj.id = this.id;
        obj.name = this.name;
        obj.host = this.host;
        obj.description = this.description;
        obj.createdAt = this.createdAt || new Date();
        obj.updatedAt = this.updatedAt || new Date();
        obj.deletedAt = this.deletedAt || null;
        return obj;
    }
}