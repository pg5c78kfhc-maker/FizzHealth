import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Food editor presents Ingredient only and Discontinued as switches in order',()=>{
 const ingredient=main.indexOf('<b>Ingredient only</b>');
 const discontinued=main.indexOf('<b>Discontinued</b>',ingredient);
 const category=main.indexOf('<label>Category',discontinued);
 assert.ok(ingredient>=0);
 assert.ok(discontinued>ingredient);
 assert.ok(category>discontinued);
 assert.match(main,/food-lifecycle-toggle[^>]*>.*role="switch"/s);
 assert.match(css,/\.food-lifecycle-toggle input\[type=checkbox\].*border-radius:999px/s);
});

test('Discontinuing requires confirmation and persists through canonical archive lifecycle',()=>{
 assert.match(main,/if\(on&&!window\.confirm\(`Discontinue/);
 assert.match(main,/const discontinued=form\.discontinued\?1:0/);
 assert.match(main,/['"]archived=\?['"],['"]archived_at=\?['"]/);
 assert.match(main,/discontinued\?\(currentFood\.archived_at\|\|now\):null/);
 assert.match(main,/UPDATE pantry SET discontinued=\?/);
 assert.match(main,/UPDATE meal_definitions SET/);
});

test('Discontinued food remains editable for restoration and active surfaces use archive filters',()=>{
 assert.match(main,/\{!isRecipe&&<button[^>]+onClick=\{\(\)=>setEditingFood\(true\)\}/);
 const activeFilters=(main.match(/COALESCE\(archived,0\)=0/g)||[]).length;
 assert.ok(activeFilters>=10,`expected broad active-surface filtering, found ${activeFilters}`);
 assert.match(main,/archived:form\.discontinued\?1:0/);
});

test('release identification is v1.4.15.25',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.25'/);
 assert.match(main,/const BUILD_ID='141525'/);
 assert.match(main,/const DEPLOYMENT_ID='FH-20260728-141525'/);
});
