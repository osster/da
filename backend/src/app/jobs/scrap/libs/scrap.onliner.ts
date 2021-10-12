import { Logger } from '@nestjs/common';
import axios from 'axios';
import { configService } from '../../../../config/config.service';
const Queue = require('bull');
const fs = require('fs');
const path = require('path');

async function getJson (url: string) {
    // https://catalog.onliner.by/sdapi/catalog.api/facets/mobile
    const data = await axios
    .get(url)
    .then(res => {
        console.log(`statusCode: ${res.status}`);
        return res.data;
    })
    .catch(error => {
      console.error(error);
    });
    return data;
}

async function storeJson(json: string) {
    const tmpDir = configService.getTmpDir();
    const sfx = Math.round(Math.random() * 100000);
    let baseDir = path.join(tmpDir, `${sfx}_onliner.json`);
    fs.open(`${baseDir}`, 'wx', (err, desc) => {
    if(!err && desc) {
        fs.writeFile(desc, json, (err) => {
            // Rest of your code
            if (err) throw err;             
            Logger.verbose(`Results Received at ${baseDir}`, 'storeJson');
        })
    }
    })
    return baseDir;
}


const ScrapOnlinerCatalogQueue = async function (siteId: string, sectionId: string, url: string) {
    const json = await getJson(url);
    const filePath = await storeJson(JSON.stringify(json));
    return { 
        siteId,
        sectionId,
        url,
        file: filePath,
        t: new Date() 
    };
};

export default ScrapOnlinerCatalogQueue;