import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync('src/styles.css','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');

test('food library reserves six explicit grid rows',()=>{
  assert.match(css,/grid-template-rows:auto auto auto auto auto minmax\(0,1fr\)/);
});

test('food library search is compact and cannot vertically grow',()=>{
  assert.match(css,/\.food-library-page \.search\{[^}]*height:52px[^}]*max-height:52px[^}]*flex:0 0 52px/s);
});

test('archived foods and recipes can be restored from detail',()=>{
  assert.match(main,/async function restoreArchived\(\)/);
  assert.match(main,/UPDATE recipes SET archived=0,archived_at=NULL,restored_at=\?/);
  assert.match(main,/UPDATE foods SET archived=0,archived_at=NULL,restored_at=\?/);
  assert.match(main,/Restore to Active/);
});

test('release metadata is v1.4.11.37',()=>{
  assert.match(main,/const VERSION='1\.4\.11\.37'/);
  assert.match(main,/const BUILD_ID='141137'/);
});
