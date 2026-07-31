import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('v1.4.15.75 alignment remains superseded by the approved v1.4.15.76 inventory vocabulary',()=>{
 assert.match(source,/Servings per container/);
 assert.match(source,/Containers in stock/);
 assert.match(source,/Servings remaining in open container/);
});
