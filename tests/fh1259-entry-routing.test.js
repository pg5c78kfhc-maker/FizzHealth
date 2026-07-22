import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('FH-1259 exposes meal logging from the Food hub',()=>{
  assert.match(main,/className="food-hub-promoted food-subsystem-grid"/);
  assert.match(main,/id:'add',Icon:Apple,title:'Meals'/);
});

test('FH-1259 distinguishes pantry creation from meal logging',()=>{
  assert.match(main,/aria-label="Add pantry item"/);
  assert.doesNotMatch(main,/> Add food<\/button>/);
  assert.match(main,/<small>PANTRY<\/small><h3>Add food manually<\/h3>/);
  assert.doesNotMatch(main,/className="primary" onClick=\{\(\)=>setShowManual\(true\)\}><Plus\/> Add to pantry/);
});
