import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEnum, IsInstance, IsNumber, IsString, IsUUID } from "class-validator";
import { Option, OptionType } from "../../models/options.entity";
import { Dictionary } from "../../models/dictionaries.entity";

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
    @IsArray()
    dictionary: Dictionary;

    @ApiProperty({ required: true })
    @IsDate()
    created_at: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updated_at: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deleted_at: Date;

    public static fill(dto: Partial<OptionDTO>): OptionDTO {
        const obj = new OptionDTO();
        obj.id = dto.id;
        obj.name = dto.name;
        obj.description = dto.description;
        obj.type = dto.type;
        obj.parameter_id = dto.parameter_id;
        obj.bool_type = dto.bool_type;
        obj.unit = dto.unit;
        obj.ratio = dto.ratio;
        obj.operation = dto.operation;
        obj.dictionary = dto.dictionary;
        obj.created_at = dto.created_at;
        obj.updated_at = dto.updated_at;
        obj.deleted_at = dto.deleted_at;
        return obj;
    }

    public toEntity(): Option {
        const obj = new Option();
        obj.id = this.id;
        obj.name = this.name;
        obj.description = this.description;
        obj.type = this.type;
        obj.parameter_id = this.parameter_id;
        obj.dictionary = this.dictionary;
        obj.bool_type = this.bool_type;
        obj.unit = this.unit;
        obj.ratio = this.ratio;
        obj.operation = this.operation;
        obj.created_at = this.created_at || new Date();
        obj.updated_at = this.updated_at || new Date();
        obj.deleted_at = this.deleted_at || null;
        return obj;
    }
}