import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release metadata is current',()=>{
  assert.equal(version.version,'1.4.15.42');
  assert.match(main,/const VERSION='1\.4\.15\.42'/);
});

test('food detail has exactly the approved three record tabs',()=>{
  assert.match(main,/\['nutrition','Nutrition'\]/);
  assert.match(main,/\['inventory','Inventory'\]/);
  assert.match(main,/\['shopping','Shopping'\]/);
});

test('Nutrition remains the default tab',()=>{
  assert.match(main,/useState\('nutrition'\)/);
  assert.match(main,/recordTab==='nutrition'/);
});

test('Inventory and Shopping are placeholders only',()=>{
  assert.match(main,/Coming in the next release\./);
  assert.match(main,/recordTab==='inventory'\?'Inventory':'Shopping'/);
});

test('tab selection preserves independent scroll positions',()=>{
  assert.match(main,/tabScrollPositions=useRef\(\{nutrition:0,inventory:0,shopping:0\}\)/);
  assert.match(main,/tabScrollPositions\.current\[recordTab\]=page\.scrollTop/);
});

test('active tab uses the approved green underline',()=>{
  assert.match(css,/\.record-detail-tabs button\.active::after/);
  assert.match(css,/background:#a5ef38/);
});

test('Food and Meals viewport no longer double-reserves footer space',()=>{
  assert.match(css,/body\.food-library-active \.app\{padding-bottom:0!important\}/);
  assert.match(css,/height:calc\(100dvh - var\(--bottom-nav-height\)\)!important/);
});
