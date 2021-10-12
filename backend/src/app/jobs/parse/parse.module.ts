import { Module } from "@nestjs/common";
import { ParseProcess } from "./parse.process";
import { ParseService } from "./parse.service";

@Module({
    providers: [ParseService, ParseProcess],
    exports: [ParseService, ParseProcess],
})
export class ParseModule {}