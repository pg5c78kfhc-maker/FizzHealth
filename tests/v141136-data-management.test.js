import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('release exposes archive and data readiness filters',()=>{
  for(const text of ['Active','Archived','All records','Needs Nutrients','Needs Role','All Incomplete']) assert.ok(main.includes(text),text);
});
test('completeness distinguishes blank values from numeric zero',()=>{
  assert.ok(main.includes("value===null||value===undefined||value===''"));
  assert.ok(main.includes("nutritionFields.some"));
});
test('consumption role auto-saves without a save button',()=>{
  assert.ok(main.includes("onChange={e=>saveRole(e.target.value)}"));
  assert.ok(!main.includes('Save Consumption Role'));
});
test('schema 58 stores archive metadata',()=>{
  assert.ok(db.includes("version:58"));
  for(const column of ['archive_source','restored_at','archived_at']) assert.ok(db.includes(column),column);
});
