import * as Data from './data';
import * as fs from "node:fs";

function isIgnored(path: string): boolean {
    return path.split('/').some(s => s === '.nugit');
}


export function writeTree(dir: string='.') {

    const files: string[] = fs.readdirSync(dir);
    // let r: string[] = result;
    let entries: { name: string, id: string, type: string}[] = [];

    for (const item of files) {

        let path: string = `${dir}/${item}`

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
