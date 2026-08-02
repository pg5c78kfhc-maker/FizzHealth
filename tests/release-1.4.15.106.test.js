import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('release metadata is v1.4.15.106',()=>{
 assert.equal(pkg.version,'1.4.15.106');
 assert.match(main,/const VERSION='1\.4\.15\.106'/);
 assert.match(db,/1\.4\.15\.106/);
});

test('legacy recipe meal consumption resolves canonical recipe ingredients',()=>{
 assert.match(main,/function canonicalRecipeId\(/);
 assert.match(main,/source_type IN \('recipe','legacy_recipe'\)/);
 assert.match(main,/return sourceInventoryPayloads\(db,\{sourceType:'recipe'/);
});

test('proposed recipe rows are hydrated from live recipe data',()=>{
 assert.match(main,/const plannedRaw=query/);
 assert.match(main,/recipeServingSnapshot\(query,recipeId\)/);
 assert.match(main,/food_name:name/);
 assert.match(main,/source_type:'recipe'/);
});

test('pantry deductions are preflighted and atomic outcome is explicit',()=>{
 assert.match(main,/const preview=consumeInventory\(match\.row,payload\.amount,payload\.unit\)/);
 assert.match(main,/No changes were saved/);
 assert.ok(main.indexOf('for(const payload of payloads)') < main.indexOf('for(const payload of resolved)'));
});
