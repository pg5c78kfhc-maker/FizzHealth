import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Library Food cards reconnect the existing permanent delete routine',()=>{
  assert.match(main,/onDelete=\{\(\)=>permanentlyDeleteFood\(x\)\}/);
  assert.match(main,/className="swipe-delete"[\s\S]*aria-label=\{`Delete \$\{label\}`\}/);
  assert.match(main,/Permanently delete \$\{f\.name\}\?/);
  assert.match(main,/DELETE FROM favorite_foods WHERE food_id=\?/);
  assert.match(main,/DELETE FROM foods WHERE food_id=\?/);
});

test('Food swipe rail exposes all four existing actions without redesigning cards',()=>{
  assert.match(main,/actionCount=archived\?2:2\+\(onCategory\?1:0\)\+\(onDelete\?1:0\)/);
  assert.match(main,/setOffset\(left\?-leftOpenWidth:right\?88:0\)/);
  assert.match(css,/discovery-swipe\.has-delete-action \.discovery-swipe-rail\{width:336px!important/);
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
});

test('Reviewed JSON serving basis is normalized before Food persistence',()=>{
  assert.match(main,/const importedServing=proposed=>/);
  assert.match(main,/proposed\?\.default_serving\?\?proposed\?\.amount/);
  assert.match(main,/default_serving:serving\.default_serving,unit:serving\.unit/);
  assert.match(main,/serving_description:serving\.serving_description/);
});

test('Schema 88 repairs only one-sided serving basis and records release metadata',()=>{
  assert.match(database,/TARGET_SCHEMA_VERSION=88/);
  assert.match(database,/version:88,name:'food_delete_and_serving_corrective'/);
  assert.match(database,/WHERE \(default_serving IS NULL OR default_serving<=0\)[\s\S]*COALESCE\(TRIM\(unit\),''\)<>''/);
  assert.match(database,/WHERE COALESCE\(TRIM\(unit\),''\)=''[\s\S]*default_serving>0/);
  assert.match(database,/VALUES \('1\.4\.15\.62','2026-07-30','141562',88/);
});

test('Library distinguishes untracked Food from a failed servings calculation',()=>{
  assert.match(main,/!tracked\?'Not tracked in Pantry':value==null\?'Servings unavailable'/);
  assert.match(main,/formatAvailableServings\(foodServingsAvailable\(x\),libraryInventoryState\('food',x\)\.tracked\)/);
});
