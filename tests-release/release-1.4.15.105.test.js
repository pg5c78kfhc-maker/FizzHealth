import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('restaurant names resolve canonically and propagate on rename',()=>{
  assert.match(main,/LEFT JOIN restaurants r ON r\.restaurant_id=rm\.restaurant_id/);
  assert.match(main,/UPDATE restaurant_meals SET restaurant_name=\?,updated_at=\?/);
  assert.match(db,/Workflow Stability and Canonical Restaurant Names/);
});

test('meal duplication creates a fresh source identity',()=>{
  assert.match(main,/source:'user-duplicate'/);
  assert.match(main,/source_record_id:`duplicate:\$\{row\.id\}:\$\{now\.getTime\(\)\}`/);
  assert.doesNotMatch(main,/const now=new Date\(\),copy=\{\.\.\.row,id:null,eaten_at:[^\n]+timezone_offset_minutes:-now\.getTimezoneOffset\(\)\};/);
});

test('Nutrition workflows are contained above the footer',()=>{
  assert.match(css,/\.menu-copy-backdrop,[\s\S]*\.unknown-barcode-page[\s\S]*bottom:calc\(var\(--bottom-nav-height/);
  assert.match(css,/\.unknown-barcode-page \.decision-page-inner[\s\S]*overflow-y:auto/);
});

test('barcode matched Food detail provides +1 inventory action',()=>{
  assert.match(main,/aria-label="Add one container to Pantry">\+1/);
  assert.match(main,/event_type,quantity,unit,event_at,notes/);
  assert.match(main,/Barcode quick add \+1/);
});
