import { Logger } from "@nestjs/common";
import axios from "axios";
import { configService } from "../../../config/config.service";

const fs = require("fs");
const path = require("path");

export async function getHtml (url: string): Promise<any> {
    const data = await axios
        .get(url)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            console.error(error);
        });
    Logger.verbose(`Results Received from ${url}`, 'helpers');
    return data;
}

export async function getJson (url: string): Promise<string> {
    // const proxy = {
    //     protocol: 'https',
    //     host: '127.0.0.1',
    //     port: 9000,
    //     auth: {
    //         username: 'mikeymike',
    //         password: 'rapunz3l'
    //     }
    // };
    const data = await axios
        .get(url/*, {
            proxy
        }*/)
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

export function storeHtml(html: string, name: string): string|null {
    const tmpDir = configService.getTmpDir();
    const sfx = Math.round(Math.random() * 100000);
    try {
        const filePath = path.join(tmpDir, `${name}_${sfx}.html`);
        fs.writeFileSync(filePath, html, { flag: "wx" });
        Logger.verbose(`Results Stored at ${filePath}`, 'helpers');
        return filePath;
    } catch (e) {
        Logger.error(`Results Store fails at ${`${tmpDir}/${sfx}_${name}.html`}`, 'helpers');
        console.error(e);
        return null;
    }
}