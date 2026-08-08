import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_SEED_BOOKS,AUDIBLE_SEED_SQL} from '../src/audio/audibleSeed.js';
import {AUDIBLE_CATALOG_SNAPSHOT} from '../src/audio/audibleCatalogSnapshot.js';
import {primeAudibleCoverCache,AUDIBLE_COVER_CACHE_NAME} from '../src/audio/audibleCoverCache.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release identity is v1.4.17.24 and schema remains 147',()=>{
  assert.equal(version.version,'1.4.17.24');
  assert.equal(version.schema_version,147);
  assert.match(main,/const VERSION='1\.4\.17\.24'/);
});

test('existing 450 audiobook seed remains unique when next capture cannot be fully materialized',()=>{
  assert.equal(AUDIBLE_SEED_BOOKS.length,450);
  assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(x=>x.asin)).size,450);
});

test('validated snapshot cover becomes a remote seed URL while packaged fallback remains available',()=>{
  const sample=AUDIBLE_CATALOG_SNAPSHOT.B06XWYTPKM;
  assert.ok(sample?.sourceCoverImageUrl?.startsWith('https://m.media-amazon.com/'));
  assert.ok(sample?.coverImageUrl?.startsWith('/audible-covers/'));
  assert.match(AUDIBLE_SEED_SQL,/audible-validated-remote/);
  assert.match(AUDIBLE_SEED_SQL,/https:\/\/m\.media-amazon\.com\//);
});

test('cover cache skips healthy cached art and caches newly fetched remote art',async()=>{
  const stored=new Map();
  const cache={
    async match(url){return stored.get(url)||null},
    async put(url,response){stored.set(url,response)}
  };
  const cacheStorage={async open(name){assert.equal(name,AUDIBLE_COVER_CACHE_NAME);return cache}};
  const response={ok:false,type:'opaque',clone(){return this}};
  const first='https://m.media-amazon.com/images/I/one.jpg';
  const second='https://m.media-amazon.com/images/I/two.jpg';
  stored.set(first,response);
  let fetches=0;
  const result=await primeAudibleCoverCache([{cover_image_url:first},{cover_image_url:second},{cover_image_url:second}],{
    cacheStorage,
    fetchImpl:async()=>{fetches++;return response},
    concurrency:2
  });
  assert.deepEqual(result,{attempted:2,fulfilled:1,failed:0,alreadyCached:1});
  assert.equal(fetches,1);
  assert.ok(stored.has(second));
});

test('service worker persists cross-origin Amazon cover cache across releases',()=>{
  assert.match(sw,/fizz-audible-covers-v1/);
  assert.match(sw,/key!==CACHE&&key!==AUDIBLE_COVER_CACHE/);
  assert.match(sw,/url\.hostname==='m\.media-amazon\.com'/);
  assert.match(sw,/cache\.match\(event\.request\)/);
  assert.match(sw,/cache\.put\(event\.request,response\.clone\(\)\)/);
});

test('Audible UI uses remote-first artwork with packaged fallback and pull-to-refresh cache warming',()=>{
  assert.match(main,/snapshot\?\.sourceCoverImageUrl/);
  assert.match(main,/snapshot\?\.coverImageUrl/);
  assert.match(main,/src===remote&&local&&local!==remote/);
  assert.match(main,/await primeAudibleCoverCache\(books\)/);
  assert.match(main,/artwork caches automatically as viewed/);
});
