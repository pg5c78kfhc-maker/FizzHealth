import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('v1.4.11.8 metadata is current',()=>{
  assert.equal(meta.version,'1.4.11.18');
  assert.equal(meta.build,'141318');
  assert.equal(meta.release_id,'FH-20260723-141318');
});

test('Meals library opens on explicit meal records',()=>{
  assert.match(main,/\[view,setView\]=useState\(\(\)=>localStorage\.getItem\('fizz-open-meal-planner'\)==='1'\?'pantry':'meals'\)/);
  assert.match(main,/SELECT \* FROM meal_definitions WHERE COALESCE\(archived,0\)=0/);
  assert.match(main,/view==='meals'&&mealDefs\.map/);
});

test('Meals library has one contained responsive viewport',()=>{
  assert.match(main,/className="food-library-page"/);
  assert.doesNotMatch(main,/className="add-header"><small>MEALS<\/small><h1>Meals<\/h1>/);
  assert.match(css,/\.food-library-page\{[\s\S]*max-width:100%[\s\S]*overflow:hidden/);
  assert.match(css,/\.food-library-page \.discovery-tabs\{[\s\S]*overflow-x:auto/);
  assert.match(css,/\.food-library-page \.list\.foods\{[\s\S]*overflow-y:auto;overflow-x:hidden/);
});
