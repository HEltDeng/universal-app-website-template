import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, pages, renderPage } from './render.mjs';
function walk(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(e=> ['node_modules','dist','.git'].includes(e.name) ? [] : e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
}
for (const file of walk(root)) {
  if (/\.(?:mjs|js)$/.test(file)) {
    const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if(check.status) throw new Error(check.stderr);
  }
  if(file.endsWith('.json')) JSON.parse(readFileSync(file,'utf8'));
}
for (const page of pages) {
  if (/{{[^}]+}}/.test(renderPage(page))) throw new Error(`Unresolved template: ${page}`);
}
console.log('PASS: JavaScript syntax, JSON, configuration and all page templates');
