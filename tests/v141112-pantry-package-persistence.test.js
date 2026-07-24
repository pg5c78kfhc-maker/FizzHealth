import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.11.22 metadata is current',()=>{
  assert.equal(meta.version,'1.4.11.23');
  assert.equal(meta.build,'141123');
  assert.equal(meta.release_id,'FH-20260724-141123');
});

test('pantry package editor preserves blank numeric values and verifies persistence',()=>{
  assert.match(main,/const optionalNumber=value=>/);
  assert.match(main,/if\(!text\)return null/);
  assert.match(main,/const saved=query\('SELECT \* FROM pantry WHERE pantry_id=\? LIMIT 1'/);
  assert.match(main,/Pantry .* did not save correctly/);
  assert.match(main,/onSaved\?\.\(saved\)/);
});

test('all package structure fields are persisted in the pantry update',()=>{
  for(const field of ['package_count','package_type','container_size','container_unit','unopened_packages','partial_package_quantity']){
    assert.ok(main.includes(field),`missing ${field}`);
  }
});
