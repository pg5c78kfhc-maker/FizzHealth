import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('corrective release metadata is current',()=>{
 assert.equal(version.version,'1.4.14.1A');
 assert.equal(version.build,'141401A');
 assert.equal(version.release_id,'FH-20260726-141401A');
});

test('Add to Meals is an in-place overlay above Menu chrome',()=>{
 assert.match(main,/modal-backdrop add-to-meals-backdrop/);
 assert.match(css,/\.add-to-meals-backdrop\{[\s\S]*z-index:2300/);
 assert.match(css,/\.add-to-meals-backdrop \.standard-modal-header\{[\s\S]*z-index:2302/);
});

test('destination panel is clamped below header and calendar',()=>{
 assert.match(css,/top:calc\(var\(--visual-viewport-top,0px\) \+ var\(--menu-header-height[\s\S]*var\(--menu-calendar-height,178px\)\)/);
 assert.match(css,/\.multi-select-meals\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('all five planner destinations remain rendered',()=>{
 assert.match(main,/const plannerSlots=\[\.\.\.mainCategories,'Snack','Beverage'\]/);
 assert.match(main,/const mainCategories=\['Breakfast','Lunch','Dinner'\]/);
});

test('cancel closes picker only and save persists before closing',()=>{
 assert.match(main,/onClick=\{\(\)=>setPicker\(null\)\} aria-label="Cancel"/);
 const save=main.slice(main.indexOf('async function saveAddToMeals()'),main.indexOf('const addFromMenu='));
 assert.ok(save.indexOf('await transaction')<save.indexOf('setPicker(null)'));
 assert.match(save,/setRevision\(x=>x\+1\)/);
});
