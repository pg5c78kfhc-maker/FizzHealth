import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_SEED_BOOKS} from '../src/audio/audibleSeed.js';
import {fetchAudibleCatalogMetadata,normalizeAudibleCatalogProduct,runtimeDisplayFromMinutes} from '../src/audio/audibleMetadata.js';

test('v1.4.17.20 seeds 150 unique owned Audible titles',()=>{
 assert.equal(AUDIBLE_SEED_BOOKS.length,150);
 assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(book=>book.asin)).size,150);
});

test('third Audible batch retains representative titles and series positions',()=>{
 const byAsin=new Map(AUDIBLE_SEED_BOOKS.map(book=>[book.asin,book]));
 assert.equal(byAsin.get('B08Z3KXYNJ')?.series_position,10);
 assert.equal(byAsin.get('B01MR7DKCP')?.series_name,'Slough House');
 assert.equal(byAsin.get('B01DMTPQFY')?.series_position,1);
});

test('catalog metadata parser prefers real product image and runtime',()=>{
 const value=normalizeAudibleCatalogProduct({asin:'b0test0001',runtime_length_min:645,product_images:{'500':'https://m.media-amazon.com/images/I/example.jpg'}});
 assert.equal(value.asin,'B0TEST0001');
 assert.equal(value.runtimeMinutes,645);
 assert.equal(value.coverImageUrl,'https://m.media-amazon.com/images/I/example.jpg');
 assert.equal(runtimeDisplayFromMinutes(645),'10h 45m');
});


test('catalog enrichment batches ASINs and normalizes API response',async()=>{
 const calls=[];
 const fakeFetch=async url=>{calls.push(String(url));return {ok:true,json:async()=>({products:[{asin:'B000000001',runtime_length_min:120,product_images:{'500':'https://example.test/cover.jpg'}}]})}};
 const result=await fetchAudibleCatalogMetadata(['B000000001'],{fetchImpl:fakeFetch});
 assert.equal(calls.length,1);
 assert.match(calls[0],/api\.audible\.com\/1\.0\/catalog\/products\?/);
 assert.match(calls[0],/asins=B000000001/);
 assert.equal(result.get('B000000001')?.coverImageUrl,'https://example.test/cover.jpg');
 assert.equal(result.get('B000000001')?.runtimeMinutes,120);
});

test('obsolete ASIN-derived cover URL is removed from seed/database sync',()=>{
 const seed=fs.readFileSync(new URL('../src/audio/audibleSeed.js',import.meta.url),'utf8');
 const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
 assert.ok(!seed.includes('images-na.ssl-images-amazon.com/images/P/'));
 assert.ok(db.includes("cover_image_source='amazon-asin-derived'"));
 assert.ok(db.includes('cover_image_url=NULL'));
});

test('Audible UI retains runtime coverage and online enrichment wiring',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.ok(main.includes('fetchAudibleCatalogMetadata'));
 assert.ok(main.includes('missing.</small>'));
 assert.ok(main.includes("cover_image_source='audible-catalog-api'"));
 assert.ok(main.includes("const VERSION='1.4.17.20'"));
});
