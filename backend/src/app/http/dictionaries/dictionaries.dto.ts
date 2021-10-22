import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInstance, IsString, IsUUID } from "class-validator";
import { Option } from "../../models/options.entity";
import { Dictionary } from "../../models/dictionaries.entity";
import { Site } from "../../models/site.entity";

export class DictionaryDTO implements Readonly<DictionaryDTO> {

    @ApiProperty({ required: true })
    @IsUUID()
    id: string;

    @ApiProperty({ required: true })
    @IsString()
    key: string;

    @ApiProperty({ required: true })
    @IsString()
    name: string;

    @ApiProperty({ required: true })
    @IsDate()
    created_at: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updated_at: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deleted_at: Date;
    
    @ApiProperty({ required: true })
    @IsInstance(Site)
    site: Site;
    
    @ApiProperty({ required: true })
    @IsInstance(Option)
    option: Option;

    public static fill(dto: Partial<DictionaryDTO>): DictionaryDTO {
        // console.log({ dto });
        const obj = new DictionaryDTO();
        obj.id = dto.id;
        obj.key = dto.key;
        obj.name = dto.name;
        obj.site = dto.site;
        obj.option = dto.option;
        obj.created_at = dto.created_at;
        obj.updated_at = dto.updated_at;
        obj.deleted_at = dto.deleted_at;
        return obj;
    }

    public toEntity(): Dictionary {
        const obj = new Dictionary();
        obj.id = this.id;
        obj.key = this.key;
        obj.name = this.name;
        obj.created_at = this.created_at || new Date();
        obj.updated_at = this.updated_at || new Date();
        obj.deleted_at = this.deleted_at || null;
        return obj;
    }
}