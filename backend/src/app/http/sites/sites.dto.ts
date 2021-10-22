import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, IsDate, IsEnum, } from 'class-validator';
import { Site, SiteType } from "./../../models/site.entity";

export class SiteDTO implements Readonly<SiteDTO> {

    @ApiProperty({ required: true })
    @IsUUID()
    id: string;

    @ApiProperty({ required: true })
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    description: string;

    @ApiProperty({ required: true })
    @IsString()
    host: string;

    @ApiProperty({ required: false })
    @IsEnum(SiteType)
    type: SiteType;

    @ApiProperty({ required: true })
    @IsDate()
    created_at: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updated_at: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deleted_at: Date;

    public static fill(dto: Partial<SiteDTO>): SiteDTO {
        const obj = new SiteDTO();
        obj.id = dto.id;
        obj.name = dto.name;
        obj.host = dto.host;
        obj.description = dto.description;
        obj.type = dto.type;
        obj.created_at = dto.created_at;
        obj.updated_at = dto.updated_at;
        obj.deleted_at = dto.deleted_at;
        return obj;
    }

    public toEntity(): Site {
        const obj = new Site();
        obj.id = this.id;
        obj.name = this.name;
        obj.host = this.host;
        obj.description = this.description;
        obj.type = this.type;
        obj.created_at = this.created_at || new Date();
        obj.updated_at = this.updated_at || new Date();
        obj.deleted_at = this.deleted_at || null;
        return obj;
    }
}