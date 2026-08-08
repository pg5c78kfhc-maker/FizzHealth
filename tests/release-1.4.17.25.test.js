import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_SEED_BOOKS} from '../src/audio/audibleSeed.js';
import {AUDIBLE_EXCHANGE_FORMAT,AUDIBLE_EXCHANGE_SCHEMA_VERSION,AUDIBLE_REQUEST_TYPE,AUDIBLE_RESPONSE_TYPE,AUDIBLE_OPERATION,buildAudibleBatchRequest,parseAudibleExchangeJson,validateAudibleBatchResponse,audibleExistingRecord,summarizeAudibleImport} from '../src/audio/audibleExchange.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const modal=fs.readFileSync(new URL('../src/audio/AudibleExchangeModal.jsx',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

const response=(books,requestId='req-1')=>({format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:requestId,operation:AUDIBLE_OPERATION,audiobooks:books});
const book=(asin='B09HVWR3V6',extra={})=>({media_type:'audiobook',audible_asin:asin,title:'22 Seconds',authors:['James Patterson','Maxine Paetro'],narrators:['January LaVoy'],runtime_minutes:496,cover_image_url:'https://m.media-amazon.com/images/I/test.jpg',ownership_status:'owned',listening_status:'not_started',...extra});

test('release identity advances to v1.4.17.25 while schema remains 147',()=>{
 assert.equal(version.version,'1.4.17.25');
 assert.equal(version.schema_version,147);
 assert.match(main,/const VERSION='1\.4\.17\.25'/);
});

test('Audible request is versioned, batch-oriented, audiobook-only, and supports new or enrichment modes',()=>{
 const request=buildAudibleBatchRequest({mode:'add_new',batchSize:50});
 assert.equal(request.format,AUDIBLE_EXCHANGE_FORMAT);
 assert.equal(request.schema_version,1);
 assert.equal(request.request_type,AUDIBLE_REQUEST_TYPE);
 assert.equal(request.operation,AUDIBLE_OPERATION);
 assert.equal(request.batch_size,50);
 assert.equal(request.audiobook_schema.media_type,'audiobook');
 assert.ok(request.instructions.rules.some(x=>x.includes('Exclude podcast')));
 const enrichment=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:[{audible_asin:'B09HVWR3V6'}]});
 assert.equal(enrichment.existing_records.length,1);
});

test('Audible response parser tolerates fences and surrounding text and validates cover/runtime fields',()=>{
 const payload=response([book()]);
 const text=`Here is the JSON:\n\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``;
 const parsed=parseAudibleExchangeJson(text).payload;
 const validated=validateAudibleBatchResponse(parsed,{expectedRequestId:'req-1',maxRecords:50});
 assert.equal(validated.audiobooks.length,1);
 assert.equal(validated.audiobooks[0].audible_asin,'B09HVWR3V6');
 assert.equal(validated.audiobooks[0].cover_image_url,'https://m.media-amazon.com/images/I/test.jpg');
 assert.equal(validated.audiobooks[0].runtime_minutes,496);
});

test('batch validation rejects duplicate ASINs, podcasts, non-HTTPS covers, and mismatched request IDs',()=>{
 assert.throws(()=>validateAudibleBatchResponse(response([book(),book()]),{expectedRequestId:'req-1'}),/Duplicate ASIN/);
 assert.throws(()=>validateAudibleBatchResponse(response([book('B09HVWR3V7',{media_type:'podcast_episode'})]),{expectedRequestId:'req-1'}),/not marked as an audiobook/);
 assert.throws(()=>validateAudibleBatchResponse(response([book('B09HVWR3V7',{cover_image_url:'http:\/\/example.com\/cover.jpg'})]),{expectedRequestId:'req-1'}),/non-HTTPS/);
 assert.throws(()=>validateAudibleBatchResponse(response([book()]),{expectedRequestId:'other'}),/different Audible exchange request/);
});

test('existing-record export and reconciliation summary support non-destructive enrichment',()=>{
 const existing=audibleExistingRecord({audible_asin:'b09hvwr3v6',title:'22 Seconds',authors:'James Patterson · Maxine Paetro',runtime_minutes:null,cover_image_url:null,ownership_status:'owned'});
 assert.equal(existing.audible_asin,'B09HVWR3V6');
 assert.deepEqual(existing.authors,['James Patterson','Maxine Paetro']);
 const summary=summarizeAudibleImport([book(),book('B008UYHZ1U',{title:'600 Hours of Edward'})],new Set(['B09HVWR3V6']));
 assert.deepEqual(summary,{received:2,newCount:1,existingCount:1,covers:2,runtimes:2});
});

test('Audible UI exposes JSON exchange, transactional ASIN upsert, and immediate cover cache warming',()=>{
 assert.match(main,/JSON Library Exchange/);
 assert.match(main,/AudibleExchangeModal/);
 assert.match(modal,/audible-json-library-import/);
 assert.match(modal,/SELECT \* FROM audible_audiobooks WHERE audible_asin=\?/);
 assert.match(modal,/No partial batch was retained/);
 assert.match(modal,/await primeAudibleCoverCache\(refreshed\)/);
 assert.match(modal,/chatgpt-json-exchange/);
});

test('authoritative seed remains 450; future library growth occurs through JSON import rather than source seeding',()=>{
 assert.equal(AUDIBLE_SEED_BOOKS.length,450);
 assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(x=>x.asin)).size,450);
});
