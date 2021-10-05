import axios from 'axios';
import { configService } from '../../../../config/config.service';
const Queue = require('bull');
const fs = require('fs');
const path = require('path');

async function getJson () {
    // https://catalog.onliner.by/sdapi/catalog.api/facets/mobile
    const data = await axios
    .get('https://catalog.onliner.by/sdapi/catalog.api/facets/mobile')
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
    let baseDir = path.join(tmpDir, `${(new Date()).getTime()}_onliner.json`);
    fs.open(`${baseDir}`, 'wx', (err, desc) => {
    if(!err && desc) {
        fs.writeFile(desc, json, (err) => {
            // Rest of your code
            if (err) throw err;               
            console.log('Results Received');
        })
    }
    })
    return baseDir;
}


const ScrapOnlinerCatalogQueue = async function () {
    const json = await getJson();
    const filePath = await storeJson(JSON.stringify(json));
    return { 
        file: filePath,
        t: new Date() 
    };
};

export default ScrapOnlinerCatalogQueue;