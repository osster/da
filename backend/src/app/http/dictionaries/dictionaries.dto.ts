import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInstance, IsString, IsUUID } from "class-validator";
import { Option } from "../../models/options.entity";
import { Dictionary } from "../../models/dictionary.entity";
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
    createdAt: Date;

    @ApiProperty({ required: true })
    @IsDate()
    updatedAt: Date;

    @ApiProperty({ required: false })
    @IsDate()
    deletedAt: Date;
    
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
        obj.createdAt = dto.createdAt;
        obj.updatedAt = dto.updatedAt;
        obj.deletedAt = dto.deletedAt;
        return obj;
    }

    public toEntity(): Dictionary {
        const obj = new Dictionary();
        obj.id = this.id;
        obj.key = this.key;
        obj.name = this.name;
        obj.site = this.site;
        obj.option = this.option;
        obj.createdAt = this.createdAt || new Date();
        obj.updatedAt = this.updatedAt || new Date();
        obj.deletedAt = this.deletedAt || null;
        return obj;
    }
}