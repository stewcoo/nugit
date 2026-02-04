import * as fs from "node:fs";
import { createHash } from "crypto";

const DIR = '.nugit';

export function init() {
    fs.mkdirSync(DIR);
    return `empty nugit directory initialized in ${process.cwd()}/${DIR}`;
}

export function hashObject(data: string): string {

    const objID: string = createHash('sha1').update(data).digest('hex'); // chaining still feels like black magic
    const objDir: string = `${DIR}/objects`;

    // make sure nugit is initialized
    if (!fs.existsSync(DIR)) return 'WHOOPS! nugit directory not found...\n\tUse command: "nugit init"';
    // make sure object directory exists
    if (!fs.existsSync(objDir)) fs.mkdirSync(objDir);

    // todo implement binary encoding
    fs.writeFileSync(`${objDir}/${objID}`, data, 'utf-8'); // change encoding
    return objID;
}

export function cat(id: string): string {
    return fs.readFileSync(`${DIR}/objects/${id}`, 'utf-8'); // change encoding
}