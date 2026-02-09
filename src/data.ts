import * as fs from "node:fs";
import { createHash } from "crypto";
import * as path from "path";

const DIR = '.nugit';

export function noDir(): string | boolean {
    // make sure nugit is initialized
    if (!fs.existsSync(DIR)) return 'WHOOPS! nugit directory not found...\n\tUse command: "nugit init"';
    return false;
}


export function init() {
    fs.mkdirSync(DIR);
    return `empty nugit directory initialized in ${process.cwd()}/${DIR}`;
}


export function setRef(ref: string, id: string) {

    const subDir: string = path.dirname(ref);
    if (!fs.existsSync(subDir)) fs.mkdirSync(`${DIR}/${subDir}`, {recursive: true});

    fs.writeFileSync(`${DIR}/${ref}`, Buffer.from(id));
}


export function getRef(ref: string): Buffer | undefined {

    if (fs.existsSync(`${DIR}/${ref}`)) {
        return fs.readFileSync(`${DIR}/${ref}`);
    }
    else if (fs.existsSync(`${DIR}/ref/tag/${ref}`)) {
        return fs.readFileSync(`${DIR}/ref/tag/${ref}`);
    } else {
        throw Error('symbolic reference not found: ' + ref);
    }
}


export function hashObject(data: Buffer, type: string='blob'): string {

    const objDir: string = `${DIR}/objects`;

    // make sure object directory exists
    if (!fs.existsSync(objDir)) fs.mkdirSync(objDir);
    
    // append object type to data
    let buff: Buffer = Buffer.concat([Buffer.from(`${type}\0`), data])
    
    const objID: string = createHash('sha1').update(buff).digest('hex'); // chaining still feels like black magic
    fs.writeFileSync(`${objDir}/${objID}`, buff, 'binary');
    
    return objID;
}


export function hashFile(filePath: string): string {
    
    let e: string | boolean = noDir();
    if (e) return e.toString();
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


export function catFile(id: string): string {

    let e = noDir();
    if (e) return e.toString();
    return cat(id).toString();
}