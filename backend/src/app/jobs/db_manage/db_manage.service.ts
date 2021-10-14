import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class DbManageService {
    constructor(
        @InjectQueue('queueDbManage')
        private readonly queueDbManage: Queue
    ) {}

    on(event: string, callback: (job: any, result: any) => void) {
        this.queueDbManage
            .on(event, (job: any, result: any) => callback(job, result));
    }  

    async jobDbManageOnlinerCatalogOptions(args) {
        return await this.queueDbManage.add('jobDbManageOnlinerCatalogOptions', args);
    }

    async jobDbManageOnlinerCatalogItems(args) {
        return await this.queueDbManage.add('jobDbManageOnlinerCatalogItems', args);
    }
}