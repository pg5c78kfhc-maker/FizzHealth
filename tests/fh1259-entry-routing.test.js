import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('FH-1259 exposes meal logging from the Food hub',()=>{
  assert.match(main,/id:'add',Icon:Plus,title:'Log food'/);
  assert.match(main,/Food Database item, Recipe, or one-time meal with Log Once/);
});

test('FH-1259 distinguishes pantry creation from meal logging',()=>{
  assert.match(main,/> Add to pantry<\/button>/);
  assert.doesNotMatch(main,/> Add food<\/button>/);
  assert.match(main,/<small>PANTRY<\/small><h3>Add food manually<\/h3>/);
});
