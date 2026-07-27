import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {formatCalories,formatGrams,formatMilligrams} from '../src/nutrition/format.js';
import {withStartupTimeout} from '../src/startup.js';

test('nutrition presentation rounds while preserving source values',()=>{
  const source=648.6666666667;
  assert.equal(formatCalories(source),'649');
  assert.equal(formatGrams(32.7),'33g');
  assert.equal(formatMilligrams(114.6),'115mg');
  assert.equal(source,648.6666666667);
});

test('startup timeout rejects stalled initialization',async()=>{
  await assert.rejects(()=>withStartupTimeout(new Promise(()=>{}),5,'startup stalled'),/startup stalled/);
});

test('Meals swipe category action reuses canonical Menu editor',()=>{
  const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.match(source,/onCategory=\{\(\)=>setMealCategoryEditor/);
  assert.match(source,/restaurant-category-editor/);
  assert.match(source,/canonicalCategoryNames\.map/);
});

test("Chef's Picks aligns to full Menu width without section gap",()=>{
  const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
  assert.match(css,/\.meal-calendar-prototype \.chef-section\{width:100%!important/);
  assert.match(css,/\.chef-section\+\.menu-category\{margin-top:0!important/);
});
