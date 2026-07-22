import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('Food hub uses the compact header add action and suppresses the floating add button',()=>{
 assert.match(main,/standard-page-head food-page-head/);
 assert.match(main,/tab==='today'&&<button className="universal-fab"/);
});

test('manual pantry creation never stores All as a physical location',()=>{
 assert.match(main,/const manualLocation=currentLocation!==['"]All['"]/);
 assert.match(main,/defaultValue=\{manualLocation\}/);
 assert.match(main,/f\.get\('location'\)\|\|manualLocation/);
});
