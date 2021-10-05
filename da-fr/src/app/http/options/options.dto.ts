import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsInstance, IsNumber, IsString, IsUUID } from "class-validator";
import { Site } from "./../../models/site.entity";
import { Option, OptionType, OptionSegments } from "./../../models/options.entity";

export class OptionDTO implements Readonly<OptionDTO> {

    @ApiProperty({ required: true })
    @IsUUID()
    id: string;

    @ApiProperty({ required: true })
    @IsString()
    name: string;
  
    @ApiProperty({ required: false })
    @IsString()
    description: string | null;
  
    @ApiProperty({ required: true })
    @IsEnum(OptionType)
    type: OptionType;
  
    @ApiProperty({ required: true })
    @IsString()
    parameter_id: string;
  
    @ApiProperty({ required: false })
    @IsString()
    dictionary_id: string;
  
    @ApiProperty({ required: false })
    @IsString()
    bool_type: string;
  
    @ApiProperty({ required: false })
    @IsString()
    unit: string;
  
    @ApiProperty({ required: false })
    @IsNumber()
    ratio: number;
  
    @ApiProperty({ required: false })
    @IsString()
    operation: string;
    
    @ApiProperty({ required: false })
    @IsEnum(OptionSegments)
    enabled_in_segments: OptionSegments;
  
    @ApiProperty({ required: false })
    @IsEnum(OptionSegments)
    visible_in_segments: OptionSegments;


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

    public static fill(dto: Partial<OptionDTO>): OptionDTO {
        const obj = new OptionDTO();
        obj.id = dto.id;
        obj.name = dto.name;
        obj.description = dto.description;
        obj.type = dto.type;
        obj.parameter_id = dto.parameter_id;
        obj.dictionary_id = dto.dictionary_id;
        obj.bool_type = dto.bool_type;
        obj.unit = dto.unit;
        obj.ratio = dto.ratio;
        obj.operation = dto.operation;
        obj.enabled_in_segments = dto.enabled_in_segments;
        obj.visible_in_segments = dto.visible_in_segments;
        obj.site = dto.site;
        obj.createdAt = dto.createdAt;
        obj.updatedAt = dto.updatedAt;
        obj.deletedAt = dto.deletedAt;
        return obj;
    }

    public toEntity(): Option {
        const obj = new Option();
        obj.id = this.id;
        obj.name = this.name;
        obj.description = this.description;
        obj.type = this.type;
        obj.parameter_id = this.parameter_id;
        obj.dictionary_id = this.dictionary_id;
        obj.bool_type = this.bool_type;
        obj.unit = this.unit;
        obj.ratio = this.ratio;
        obj.operation = this.operation;
        obj.enabled_in_segments = this.enabled_in_segments;
        obj.visible_in_segments = this.visible_in_segments;
        obj.site = this.site;
        obj.createdAt = this.createdAt || new Date();
        obj.updatedAt = this.updatedAt || new Date();
        obj.deletedAt = this.deletedAt || null;
        return obj;
    }
}