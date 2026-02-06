// import * as Data from './data';
import * as fs from "node:fs";

export function writeTree(dir: string='.', result: string[]=[]): string[] {

    const files: string[] = fs.readdirSync(dir);
    let r = result;

    for (const item of files) {
        let path = `${dir}/${item}`
        //if file
        if (fs.statSync(path).isFile()) {
            r.push(path);
        }
        // if dir
        else if (fs.statSync(path).isDirectory()){
            r = writeTree(path, r);
        }
    }

    return r;
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
//             // console.log(spacer + `${item}`);
//             r += spacer + `${item}\n`;
//         }
//         // if dir
//         else if (fs.statSync(`${dir}/${item}`).isDirectory()){
//             // console.log(spacer + `/${item}`);
//             r += spacer + `/${item}\n`;
//             r = printTree(`${dir}/${item}`, ++level, r);
//             level--;
//         }
//     }

//     return r;
// }
