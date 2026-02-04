import { readFileSync, writeFileSync } from "node:fs";

// hack to update version number at build time
const VERSION = 'nugit version ' + JSON.parse( readFileSync('./package.json', 'utf-8') ).version;
const code = `export const VERSION: string = '${VERSION}';`
writeFileSync('./src/version.ts', code, 'utf-8');