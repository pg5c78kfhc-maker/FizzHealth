import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_SEED_BOOKS,AUDIBLE_SEED_SOURCE} from '../src/audio/audibleSeed.js';
import {snapshotModule} from '../scripts/enrich-audible-catalog.mjs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('v1.4.17.22 reconciles the audiobook-only restart capture to 450 unique ASINs',()=>{
  assert.equal(AUDIBLE_SEED_BOOKS.length,450);
  assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(book=>book.asin)).size,450);
  assert.match(AUDIBLE_SEED_SOURCE,/deduped-restart-through-page-9/);
  assert.ok(AUDIBLE_SEED_BOOKS.some(book=>book.asin==='B011PVUGUG'&&/Make Me/.test(book.title)));
  assert.ok(AUDIBLE_SEED_BOOKS.some(book=>book.asin==='B003D8UFTW'&&book.title==='Presumed Innocent'));
});

test('restart data retains source-supported runtime and series metadata',()=>{
  const gotham=AUDIBLE_SEED_BOOKS.find(book=>book.asin==='B07H39RRPW');
  assert.equal(gotham.runtime_minutes,67*60+25);
  assert.equal(gotham.series_name,'Gotham');
  const inDeath=AUDIBLE_SEED_BOOKS.find(book=>book.asin==='B00CSA1DRY');
  assert.equal(inDeath.series_position,15);
  assert.equal(inDeath.runtime_minutes,12*60+44);
});

test('build-time catalog snapshot stores real cover URLs and runtimes without browser coupling',()=>{
  const moduleText=snapshotModule(new Map([['ABC1234567',{coverImageUrl:'https://m.media-amazon.com/images/I/test.jpg',runtimeMinutes:731}]]),'2026-08-08T13:00:00.000Z');
  assert.match(moduleText,/m\.media-amazon\.com/);
  assert.match(moduleText,/"runtimeMinutes": 731/);
  assert.ok(!main.includes('fetchAudibleCatalogMetadata('));
  assert.ok(main.includes('Artwork and runtime enrichment are applied during Audible library imports.'));
});

test('Audible pull-to-refresh reloads stored metadata and runtime/status lines are separated',()=>{
  assert.ok(main.includes("if(shouldRefresh&&metadataState!=='loading')refreshMetadata()"));
  assert.ok(main.includes('Refreshing stored Audible metadata…'));
  assert.ok(main.includes('audible-metadata-status'));
  assert.ok(main.includes('Runtime captured for {runtimeKnownCount} of {ownedBooks.length} titles'));
  assert.ok(!main.includes('Audible metadata refresh was unavailable'));
});

test('release metadata is v1.4.17.22 on schema 147',()=>{
  assert.equal(pkg.version,'1.4.17.22');
  assert.equal(meta.version,'1.4.17.22');
  assert.equal(meta.schema_version,147);
  assert.ok(main.includes("const VERSION='1.4.17.22'"));
  assert.ok(main.includes("const BUILD_ID='141722'"));
});
