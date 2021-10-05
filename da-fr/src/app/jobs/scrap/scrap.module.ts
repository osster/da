import { Module } from "@nestjs/common";
import { ScrapProcess } from "./scrap.process";
import { ScrapService } from "./scrap.service";

@Module({
    providers: [ScrapService, ScrapProcess],
    exports: [ScrapService, ScrapProcess],
})
export class ScrapModule {}