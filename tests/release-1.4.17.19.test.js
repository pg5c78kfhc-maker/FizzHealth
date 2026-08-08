import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const seed=fs.readFileSync('src/audio/audibleSeed.js','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');
const version=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.17.19 keeps schema 147 while synchronizing Audible seed data',()=>{
  assert.equal(version.version,'1.4.17.19');
  assert.equal(Number(version.schema_version),147);
  assert.match(db,/const TARGET_SCHEMA_VERSION=147/);
  assert.match(db,/function ensureAudibleSeedData\(\)/);
  assert.match(db,/runMigrationSql\(AUDIBLE_SEED_SQL\)/);
});

test('Audible seed contains 100 unique ASIN records',()=>{
  const asins=[...seed.matchAll(/"asin":\s*"([A-Z0-9]{10})"/g)].map(m=>m[1]);
  assert.equal(asins.length,100);
  assert.equal(new Set(asins).size,100);
  for(const expected of ['B0FKBYGP5L','B0FGYD42L8','B0DTZ6C6Z6','B09646Q379','B0G3BCDN6F'])assert.ok(asins.includes(expected),expected);
});

test('Audible library summary is live and runtime-aware',()=>{
  assert.match(main,/ownedBooks\.length/);
  assert.match(main,/totalRuntimeMinutes/);
  assert.match(main,/Runtime captured for \{runtimeKnownCount\} of \{ownedBooks\.length\} titles/);
  assert.doesNotMatch(main,/titles imported from the first library capture/);
});

test('cover enrichment backfills existing records and has a broken-image fallback',()=>{
  assert.match(seed,/images-na\.ssl-images-amazon\.com\/images\/P\//);
  assert.match(db,/UPDATE audible_audiobooks SET cover_image_url=/);
  assert.match(main,/onError=\{\(\)=>setFailed\(true\)\}/);
});

test('multi-author imports are supported',()=>{
  assert.match(seed,/const authorRows=book=>Array\.isArray\(book\.authors\)/);
  assert.match(seed,/"name": "Lee Child"/);
  assert.match(seed,/"name": "Andrew Child"/);
});
