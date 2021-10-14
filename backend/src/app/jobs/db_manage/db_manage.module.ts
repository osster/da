import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Section } from "src/app/models/sections.entity";
import { Site } from "src/app/models/site.entity";
import { configService } from "src/config/config.service";
import { DbManageService } from "./db_manage.service";

@Module({
    imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([
            Site, 
            Section, 
            Option,
        ]),
    ],
    providers: [DbManageService],
    exports: [DbManageService],
})
export class DbManageModule {}