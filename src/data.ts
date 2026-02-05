import * as fs from "node:fs";
import { createHash } from "crypto";

const DIR = '.nugit';

export function init() {
    fs.mkdirSync(DIR);
    return `empty nugit directory initialized in ${process.cwd()}/${DIR}`;
}

export function hashObject(data: Buffer, type: string='blob'): string {

    const objDir: string = `${DIR}/objects`;
    
    // make sure nugit is initialized
    if (!fs.existsSync(DIR)) return 'WHOOPS! nugit directory not found...\n\tUse command: "nugit init"';
    // make sure object directory exists
    if (!fs.existsSync(objDir)) fs.mkdirSync(objDir);
    
    // append object type to data
    let buff: Buffer = Buffer.concat([Buffer.from(`${type}\0`), data])
    
    const objID: string = createHash('sha1').update(buff).digest('hex'); // chaining still feels like black magic
    fs.writeFileSync(`${objDir}/${objID}`, buff, 'binary');
    
    return objID;
}

export function hashFile(filePath: string): string {
    return hashObject( fs.readFileSync(filePath) );
}

export function cat(id: string, expected?: string): Buffer {

    const obj: Buffer = fs.readFileSync(`${DIR}/objects/${id}`);
    const type: string = obj.subarray(0, 4).toString();

    if ( !(expected === undefined) && type !== expected) {
        throw new TypeError(`Expected type: "${expected}", got type: "${type}"`);
    }

    return obj.subarray(5);
}