import * as Data from './data';
import * as fs from "node:fs";

type Commit = {tree: string, parent: string | undefined, message: string};
export type RefValue = {symbolic: boolean, value: string};

export function getAddress(address: string): string {

    const refFolders = [
        `${address}`,
        `ref/heads/${address}`,
        `ref/tags/${address}`
    ];

    for (const ref of refFolders) {
        const address = Data.getRef(ref);
        if (address.value) return address.value;
    }
    
    return address;
}


export function createTag(name: string, commit: string) {
    Data.updateRef( `ref/tags/${name}`, {symbolic: false, value: getAddress(commit)} );
    return `Created tag: ${name} linked to commit: ${commit}`;
}


export function createBranch(name: string) {
    const commit: string = Data.getRef('HEAD').value;

    Data.updateRef( `ref/heads/${name}`, {symbolic: false, value: commit} );
    return `Created branch named '${name}'`;
}

function isBranch(name: string) {
    return Boolean(Data.getRef(`ref/heads/${name}`).value);
}

export function getCommit(address: string): Commit | undefined {

    const commitString: string = Data.cat(address, 'comm').toString();
    const commit: Commit = {
        tree: '',
        parent: undefined,
        message: ''
    };
    
    const lines = commitString.split('\n');
    let end = 0;
    for (const line of lines) {
        end++;
        if (line === '\n') break;

        const [key, value] = line.trim().split(' ');

        if (key === 'tree') commit.tree = value;
        else if (key === 'parent') commit.parent = value;

    }

    commit.message = lines[end - 1];
    return commit;
}


export function commit(message: string): string {
    
    let e: string | boolean = Data.noDir();
    if (e) return e.toString();

    let commit: string = `tree ${writeTree()}\n`;

    const parent: RefValue | undefined = Data.getRef('HEAD');
    if (parent) commit += `parent ${parent.value}\n`;
    
    commit += `\n${message}`;

    const id: string = Data.hashObject(Buffer.from(commit), 'comm');
    Data.updateRef('HEAD', {symbolic: false, value: id});

    return id;
}

export function checkout(address: string): string {

    const id = getAddress(address);
    const commit: Commit | undefined = getCommit(id);

    let head: RefValue;

    if (isBranch(address)) head = {symbolic: true, value: `ref/heads/${address}`};
    else head = {symbolic: false, value: id};

    if (commit) Data.updateRef('HEAD', head, false);
    else return 'no commit at address: ' + address;

    return readTree(commit.tree);
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

    return 'extracted tree into current working directory';
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
