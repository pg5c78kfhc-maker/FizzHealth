import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
test('v1.4.11.8 metadata is current',()=>{assert.equal(meta.version,'1.4.11.13');assert.equal(meta.build,'141230');assert.equal(meta.release_id,'FH-20260723-141230')});
test('prepared recipe save creates and verifies a pantry record',()=>{
 assert.match(main,/foodId=`recipe:\$\{recipe\.recipe_id\}`/);
 assert.match(main,/insertRecord\(db,'pantry'/);
 assert.match(main,/SELECT \* FROM pantry WHERE pantry_id=\? LIMIT 1/);
 assert.match(main,/Added \$\{batch\.quantity\} \$\{batch\.unit\}/);
});
test('food library uses visual viewport and scrolls only results',()=>{
 assert.match(main,/food-library-active/);
 assert.match(css,/body\.food-library-active \.app\{height:100dvh/);
 assert.match(css,/body\.food-library-active \.foods\{max-height:none;min-height:0;flex:1;overflow-y:auto/);
});
test('pantry search close control is before title',()=>{
 assert.match(main,/decision-detail-head"><button className="header-icon-action" onClick=\{\(\)=>setShowSearch\(false\)\}[^]*?<div><small>PANTRY INVENTORY<\/small><h2>Search Pantry<\/h2><\/div>/);
});
