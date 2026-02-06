import * as Data from './data';
import * as fs from "node:fs";

export function commit(message: string): string {
    
    let e: string | boolean = Data.noDir();
    if (e) return e.toString();

    let commit: string = `tree ${writeTree()}\n`;

    const parent: Buffer | undefined = Data.getHead();
    if (parent) commit += `parent ${parent}\n`;
    
    commit += `\n${message}\n`;

    const id: string = Data.hashObject(Buffer.from(commit), 'comm');
    Data.setHead(id);

    return id;
}

function isIgnored(path: string): boolean {
    return path.split('/').some(s => s === '.nugit');
}

function clearDir(dir: string) {
    
    const files: string[] = fs.readdirSync(dir);

    for (const item of files) {

        const path: string = `${dir}/${item}`
        const stats = fs.statSync(path);

        if (isIgnored(path)) continue;

        if (stats.isFile()) fs.rmSync(path);
        else if (stats.isDirectory()) {
            clearDir(path);
            fs.rmdirSync(path);
        }
    }
}


function* genTreeEntries(id: string) {

    const tree = Data.cat(id, 'tree').toString();

    for (const line of tree.split('\n')) {
        let entry: string[] = line.split(' ');
        yield {
            name: entry[0],
            id: entry[1],
            type: entry[2]
        };
    }
}


export function getTree(id: string, dir: string) {

    for (const entry of genTreeEntries(id)) {
        const path = `${dir}/${entry.name}`;
        // if file
        if (entry.type === 'blob') fs.writeFileSync(path, Data.cat(entry.id));
        // if dir
        if (entry.type === 'tree') {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            getTree(entry.id, path);
        }
    }

    return 'extracted tree in current directory';
}


export function readTree(id: string, dir: string='.') {
    clearDir(dir);
    return getTree(id, dir);
}


export function writeTree(dir: string='.') {

    const files: string[] = fs.readdirSync(dir);
    // let r: string[] = result;
    let entries: { name: string, id: string, type: string}[] = [];

    for (const item of files) {

        const path: string = `${dir}/${item}`

        if (isIgnored(path)) continue;

        let id: string = '';
        let type: string = '';

        const stats = fs.statSync(path);
        //if file
        if (stats.isFile()) {
            id = Data.hashFile(path);
            type = 'blob';
        }
        // if dir
        else if (stats.isDirectory()){
            id = writeTree(path);
            type = 'tree'
        }

        entries.push({
            name: item,
            id: id,
            type: type
        });
    }

    // CREATE TREE OBJECT
    let tree: string = entries.map( (entry): string => `${entry.name} ${entry.id} ${entry.type}` )
        .join('\n');

    return Data.hashObject(Buffer.from(tree), 'tree');
}

// SUPER AWESOME FUNCTION I WROTE THAT UNFORTUNATELY ISN'T VERY USEFUL
// export function printTree(dir: string='.', level: number=0, result: string=''): string {

//     const files: string[] = fs.readdirSync(dir);
//     let r: string = result;

//     for (let i = 0; i < files.length; i++) {

//         let item: string = files[i]

//         const box: string = (level >= 1) ? (i === (files.length - 1) ? '\u{2514}' : '\u{251C}') : '';
//         const spacer: string = '   '.repeat(level) + box; 

//         //if file
//         if (fs.statSync(`${dir}/${item}`).isFile()) {
//             r += spacer + ` ${item}\n`;
//         }
//         // if dir
//         else if (fs.statSync(`${dir}/${item}`).isDirectory()){
//             r += spacer + ` ${item}/\n`;
//             r = printTree(`${dir}/${item}`, ++level, r);
//             level--;
//         }
//     }

//     return r;
// }
