import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_SEED_BOOKS} from '../src/audio/audibleSeed.js';
import {aggregateAudioDurationDisplay,fetchAudibleCatalogMetadata,normalizeAudibleCatalogProduct} from '../src/audio/audibleMetadata.js';

test('v1.4.17.21 seeds 172 unique owned Audible audiobooks and excludes Audible podcast rows',()=>{
 assert.equal(AUDIBLE_SEED_BOOKS.length,172);
 assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(book=>book.asin)).size,172);
 assert.ok(AUDIBLE_SEED_BOOKS.some(book=>book.asin==='B011PVUGUG'&&book.series_position===20));
 assert.ok(AUDIBLE_SEED_BOOKS.some(book=>book.asin==='1250839688'));
 assert.ok(!AUDIBLE_SEED_BOOKS.some(book=>String(book.product_url||'').includes('/podcast/')));
});

test('Audible catalog enrichment requests an API-supported 570px cover image size',async()=>{
 const calls=[];
 const fakeFetch=async url=>{calls.push(String(url));return {ok:true,json:async()=>({products:[{asin:'B000000001',runtime_length_min:100,product_images:{'570':'https://example.test/570.jpg'}}]})}};
 const result=await fetchAudibleCatalogMetadata(['B000000001'],{fetchImpl:fakeFetch});
 assert.match(calls[0],/image_sizes=570/);
 assert.equal(result.get('B000000001')?.coverImageUrl,'https://example.test/570.jpg');
});

test('catalog normalizer prefers supported cover sizes',()=>{
 const value=normalizeAudibleCatalogProduct({asin:'B000000002',product_images:{'570':'https://example.test/right.jpg','500':'https://example.test/legacy.jpg'}});
 assert.equal(value.coverImageUrl,'https://example.test/right.jpg');
});

test('aggregate Audible duration expands only warranted year/day/hour/minute units',()=>{
 assert.equal(aggregateAudioDurationDisplay(1074*60+1),'44d 18h 1m');
 assert.equal(aggregateAudioDurationDisplay(365*24*60+27*24*60+6*60+12),'1y 27d 6h 12m');
 assert.equal(aggregateAudioDurationDisplay(62),'1h 2m');
 assert.equal(aggregateAudioDurationDisplay(0),'0m');
});

test('Audible UI exposes pull-to-refresh and persistent runtime coverage line',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.ok(main.includes('onTouchStart={beginPull}'));
 assert.ok(main.includes("pull>=54?'Release to refresh':'Pull to refresh'"));
 assert.ok(main.includes('Runtime captured for {runtimeKnownCount} of {ownedBooks.length} titles · {ownedBooks.length-runtimeKnownCount} missing.'));
 assert.ok(main.includes('aggregateAudioDurationDisplay(totalRuntimeMinutes)'));
 assert.ok(main.includes("const VERSION='1.4.17.21'"));
});
