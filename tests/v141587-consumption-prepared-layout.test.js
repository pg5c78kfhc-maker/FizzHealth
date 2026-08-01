import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Library full-swipe quick consume deducts and records Pantry adjustments',()=>{
 const start=main.indexOf('async function quickConsume');
 const block=main.slice(start,main.indexOf('async function undoQuickConsume',start));
 assert.match(block,/applySourceInventoryConsumption/);
 assert.match(block,/recordMealPantryAdjustments/);
 assert.match(block,/tracked&&!adjustments\.length/);
});
test('legacy zero-weight prepared rows remain visible and can be explicitly deleted',()=>{
 assert.match(main,/SELECT \* FROM pantry WHERE food_id=\? AND COALESCE\(discontinued,0\)=0 ORDER BY/);
 assert.match(main,/async function deletePreparedBatch/);
 assert.match(main,/Ingredient inventory was not restored/);
 assert.match(main,/prepared-batch-delete/);
});
test('Add Food and Prepared Recipe overlays stop above persistent footer',()=>{
 assert.match(css,/component-picker-backdrop[\s\S]*bottom-nav-height/);
 assert.match(css,/recipe-pantry-batch[\s\S]*bottom-nav-height/);
});
test('release metadata is v1.4.15.87',()=>assert.match(main,/const VERSION='1\.4\.15\.87'/));
