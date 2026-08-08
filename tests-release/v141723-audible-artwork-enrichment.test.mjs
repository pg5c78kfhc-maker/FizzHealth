import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {AUDIBLE_SEED_BOOKS,AUDIBLE_SEED_SQL} from '../src/audio/audibleSeed.js';
import {AUDIBLE_CATALOG_SNAPSHOT,AUDIBLE_CATALOG_SNAPSHOT_COVER_COUNT} from '../src/audio/audibleCatalogSnapshot.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const db=fs.readFileSync(path.join(root,'src/database.js'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const meta=JSON.parse(fs.readFileSync(path.join(root,'VERSION.json'),'utf8'));

test('release advances to 1.4.17.23 without a schema increment',()=>{
  assert.equal(pkg.version,'1.4.17.23');
  assert.equal(meta.version,'1.4.17.23');
  assert.equal(meta.schema_version,147);
  assert.match(main,/const VERSION='1\.4\.17\.23'/);
  assert.match(main,/const BUILD_ID='141723'/);
  assert.match(db,/const TARGET_SCHEMA_VERSION=147/);
});

test('450-title Audible library remains ASIN-unique and audiobook-only',()=>{
  assert.equal(AUDIBLE_SEED_BOOKS.length,450);
  assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(book=>book.asin)).size,450);
  assert.ok(AUDIBLE_SEED_BOOKS.every(book=>book.product_url?.includes('/pd/')));
  assert.ok(AUDIBLE_SEED_BOOKS.every(book=>!book.product_url?.includes('/podcast/')));
});

test('validated Audible covers are local packaged assets with provenance',()=>{
  assert.equal(AUDIBLE_CATALOG_SNAPSHOT_COVER_COUNT,12);
  const entries=Object.entries(AUDIBLE_CATALOG_SNAPSHOT).filter(([,v])=>v.coverImageUrl);
  assert.equal(entries.length,12);
  for(const [asin,item] of entries){
    assert.equal(item.coverImageUrl,`/audible-covers/${asin}.jpg`);
    assert.match(item.sourceCoverImageUrl,/^https:\/\/m\.media-amazon\.com\/images\/I\//);
    const file=path.join(root,'public',item.coverImageUrl);
    const bytes=fs.readFileSync(file);
    assert.ok(bytes.length>1000,`${asin} cover should contain image data`);
    assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);assert.equal(bytes[2],0xff);
  }
});

test('seed persists local cover URLs and does not overwrite established history',()=>{
  assert.match(AUDIBLE_SEED_SQL,/audible-product-page-local-cache/);
  assert.match(AUDIBLE_SEED_SQL,/cover_image_url=COALESCE\(NULLIF\(cover_image_url,''\)/);
  assert.match(AUDIBLE_SEED_SQL,/runtime_minutes=CASE WHEN COALESCE\(runtime_minutes,0\)<=0/);
});

test('Audible UI reports runtime and artwork coverage dynamically and keeps local refresh behavior',()=>{
  assert.match(main,/coverKnownCount=ownedBooks\.filter/);
  assert.match(main,/covers packaged locally/);
  assert.match(main,/Pull to refresh/);
  assert.doesNotMatch(main,/fetchAudibleCatalogMetadata/);
});
