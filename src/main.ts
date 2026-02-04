#!/usr/bin/env node
import * as Data from './data';
import { VERSION } from './version';
import { Command } from 'commander';
const program = new Command();


(function main() {

    program
        .name('Nugit')
        .description('a simple version control system')
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
        .description('Obtain an id by hashing an <object>, store the object using the id, and log the id')
        .argument('<object>', 'string value for object')
        .action((arg): void => console.log( Data.hashObject(arg) ));
    
    program.parse();

})();