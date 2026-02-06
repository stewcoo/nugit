#!/usr/bin/env node
import * as Data from './data';
import * as Base from './base';
import { Version } from './version';
import { Command } from 'commander';
const program = new Command();


(function main() {

    program
        .name('Nugit')
        .description('A simple version control system')
        .version(Version, '-v, --version');
    
    // ECHO
    program.command('echo')
        .description('Echo value of <string> for testing purposes')
        .argument('<string>', 'string to be echoed')
        .action((arg): void => console.log(arg));
    
    // INIT
    program.command('init')
        .description('Initialize nugit directory')
        .action((): void => console.log( Data.init() ));

    // HASH OBJECT
    program.command('hash')
        .description('Obtain an id by hashing a <file>, store as an object using the id, and return the id')
        .argument('<object>', 'file path for <file>')
        .action((arg): void => console.log( Data.hashFile(arg) ));
    
    // READ OBJECT
    program.command('cat')
        .description('Returns object file from <id>')
        .argument('<id>', 'hex id of object')
        .action((arg): void => console.log( Data.catFile(arg) ));

    // WRITE TREE
    program.command('write-tree')
        .description('Write current directory')
        .action((): void => console.log( Base.writeTree().join('\n') ));
    
    program.parse();

})();