import { Logger } from "@nestjs/common";
import axios from "axios";
import { configService } from "../../../config/config.service";

const fs = require("fs");
const path = require("path");

export async function getJson (url: string): Promise<string> {
    const data = await axios
        .get(url)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            console.error(error);
        });
    Logger.verbose(`Results Received from ${url}`, 'helpers');
    return JSON.stringify(data);
}

export function storeJson(json: string, name: string): string|null {
    const tmpDir = configService.getTmpDir();
    const sfx = Math.round(Math.random() * 100000);
    try {
        const filePath = path.join(tmpDir, `${name}_${sfx}.json`);
        fs.writeFileSync(filePath, json, { flag: "wx" });
        Logger.verbose(`Results Stored at ${filePath}`, 'helpers');
        return filePath;
    } catch (e) {
        Logger.error(`Results Store fails at ${`${tmpDir}/${sfx}_${name}.json`}`, 'helpers');
        console.error(e);
        return null;
    }
}