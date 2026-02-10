import * as fs from "node:fs";
import { createHash } from "crypto";
import * as path from "path";
import { RefValue } from "./base"

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


export function updateRef(ref: string, address: RefValue, deRef: boolean=true) {

    ref = getInteral(ref, deRef)[0]; 
 
    if (!address.value) throw Error('whoops');

    let value = '';
    if (address.symbolic) value = `ref: ${address.value}`;
    else value = address.value;
    
    const subDir: string = path.dirname(ref);


    if (!fs.existsSync(subDir)) fs.mkdirSync(`${DIR}/${subDir}`, {recursive: true});

    fs.writeFileSync(`${DIR}/${ref}`, Buffer.from(value));
}


export function getRef(ref: string, deRef: boolean=true): RefValue {
    return getInteral(ref, deRef)[1];
}


function getInteral(ref: string, deRef: boolean): [string, RefValue] {
    let value: string = '';
    const refPath: string = `${DIR}/${ref}`;

    
    if (fs.existsSync(refPath)) value = fs.readFileSync(refPath).toString();

    if (value.startsWith('ref:')) {
        value = value.split(':')[1].trim()
        if (deRef) {
            return getInteral(value, true);}
    }

    return [ref, {
        symbolic: false,
        value: value
    }];
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