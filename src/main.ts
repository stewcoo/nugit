#!/usr/bin/env node
import * as Data from './data';
import { VERSION } from './version';
import { Command } from 'commander';
const program = new Command();


(function main() {

    program
        .name('Nugit')
        .description('A simple version control system')
        .version(VERSION, '-v, --version');
    
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
        .description('Obtain an id by hashing an <object>, store the object using the id, and return the id')
        .argument('<object>', 'string value for object')
        .action((arg): void => console.log( Data.hashObject(arg) ));
    
    // READ OBJECT
    program.command('cat')
        .description('Returns object file from <id>') // this will eventually take a variadic argument
        .argument('<id>', 'hex id of object')
        .action((arg): void => console.log( Data.cat(arg) ));
    program.parse();

})();