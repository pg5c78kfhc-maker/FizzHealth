import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Full Nutrition Record captures brand, manufacturer, retailer, and package fields',()=>{
  for(const label of ['Brand','Company / manufacturer','Preferred retailer','Package size','Servings per package']) assert.match(main,new RegExp(label.replace('/','\\/'),'i'));
  assert.match(main,/SELECT DISTINCT retailer FROM pantry/);
});

test('multiple barcodes persist without replacing an existing canonical barcode',()=>{
  assert.match(database,/CREATE TABLE IF NOT EXISTS food_barcodes/);
  assert.match(main,/INSERT OR REPLACE INTO food_barcodes/);
  assert.match(main,/if\(!normalizeBarcode\(food\.barcode\)\)db\.run/);
  assert.doesNotMatch(main,/Multi-barcode support is not part of this release/);
});

test('release metadata is synchronized',()=>{
  assert.match(main,/const VERSION='1\.4\.15\.30'/);
  assert.match(database,/TARGET_SCHEMA_VERSION=77/);
});
