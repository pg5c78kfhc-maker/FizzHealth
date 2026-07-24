import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('prepared recipe editor renders above recipe detail',()=>{
  assert.match(css,/\.recipe-pantry-batch\s*\{[^}]*z-index:3300!important/);
  assert.match(main,/className="modal-backdrop recipe-pantry-batch"/);
});

test('prepared recipe pantry quantity is total gram weight',()=>{
  assert.match(main,/name="quantity_grams"/);
  assert.match(main,/const unit='g'/);
  assert.doesNotMatch(main,/name="unit" defaultValue="g"/);
});

test('pantry record is verified inside and after transaction',()=>{
  assert.match(main,/savedRecord=db\.query\('SELECT \* FROM pantry WHERE pantry_id=\? LIMIT 1'/);
  assert.match(main,/const persisted=query\('SELECT \* FROM pantry WHERE pantry_id=\? LIMIT 1'/);
  assert.match(main,/if\(!persisted\)throw new Error\('The prepared batch was not retained in Pantry\.'/);
});

test('optional event history cannot roll back pantry save',()=>{
  assert.match(main,/try\{insertRecord\(db,'pantry_events'/);
  assert.match(main,/catch\(eventError\)\{console\.warn\('Prepared batch event history was not recorded:'/);
});

test('mandatory release metadata is current',()=>{
  assert.equal(version.version,'1.4.11.20');
  assert.equal(version.build,'141320');
  assert.equal(version.release_id,'FH-20260724-141320');
  assert.match(main,/const VERSION='1\.4\.11\.20'/);
});
