import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Pantry editor removes duplicate counting and container prompts',()=>{
 assert.doesNotMatch(main,/What are you counting\?/);
 assert.doesNotMatch(main,/<Row label="Container">/);
 assert.match(main,/How is it packaged\?/);
 assert.match(main,/How many \$\{packagePlural\} do you have\?/);
});
test('Pantry editor uses package-aware sealed and open questions',()=>{
 assert.match(main,/How many are still sealed\?/);
 assert.match(main,/Is one \$\{packageSingular\} open\?/);
 assert.match(main,/How much is left in the open \$\{packageSingular\}\?/);
});
test('Pantry editor is constrained and stacks on narrow iPhones',()=>{
 assert.match(css,/overflow-x:hidden!important/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
});
test('release metadata identifies v1.4.15.34',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.34'/);
 assert.match(main,/FH-1415\.34D/);
});
