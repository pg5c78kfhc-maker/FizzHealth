import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 AUDIBLE_ADD_NEW_BATCH_SIZE,AUDIBLE_COVER_BATCH_SIZE,AUDIBLE_COVER_TARGET,AUDIBLE_ENRICH_BATCH_SIZE,
 AUDIBLE_EXCHANGE_FORMAT,AUDIBLE_EXCHANGE_SCHEMA_VERSION,AUDIBLE_OPERATION,AUDIBLE_RESPONSE_TYPE,AUDIBLE_TARGETED_MODE,AUDIBLE_TRANSPORT_FORMAT,
 audibleTargetIdentity,buildAudibleBatchRequest,encodeAudibleTransport,parseAudibleUniversalResponse,validateAudibleBatchResponse,validateAudibleImportAgainstLibrary
} from '../src/audio/audibleExchange.js';
import {upsertAudibleExchangeRecord} from '../src/audio/audibleExchangePersistence.js';

const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const modal=fs.readFileSync(new URL('../src/audio/AudibleExchangeModal.jsx',import.meta.url),'utf8');

const book=(i,cover=null)=>({audiobook_id:`fizz-${i}`,audible_asin:`B${String(i).padStart(9,'0')}`,title:`Book ${i}`,display_title:`Book ${i}`,audible_product_url:`https://www.audible.com/pd/B${String(i).padStart(9,'0')}`,authors:'Author',narrators:'Narrator',runtime_minutes:600,runtime_display:'10h',description:'Existing description',cover_image_url:cover,ownership_status:'owned',listening_status:'unknown'});
const library=Array.from({length:60},(_,i)=>book(i+1,i>=55?`https://m.media-amazon.com/images/I/existing${i}.jpg`:null));

function responseFor(request,audiobooks,extra={}){
 return {format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:request.request_id,operation:AUDIBLE_OPERATION,mode:request.mode,expected_record_count:audiobooks.length,requested_asins:audiobooks.map(r=>r.audible_asin),target_fields:request.target_fields||[],audiobooks,...extra};
}

test('release advances to 1.4.17.31 with schema 147 unchanged',()=>{
 assert.equal(meta.version,'1.4.17.31');assert.equal(meta.schema_version,147);assert.equal(meta.build,'141731');
 assert.match(main,/const VERSION='1\.4\.17\.31'/);assert.match(main,/const BUILD_ID='141731'/);
});

test('all outbound Audible modes require the same encoded clipboard-safe transport',()=>{
 const add=buildAudibleBatchRequest({mode:'add_new'});
 const full=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:library.slice(0,10)});
 const covers=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:library.slice(0,50).map(audibleTargetIdentity),targetFields:[AUDIBLE_COVER_TARGET]});
 for(const request of [add,full,covers]){
  assert.equal(request.response_requirements.transport_format,AUDIBLE_TRANSPORT_FORMAT);
  assert.match(request.instructions.rules.join('\n'),/Return exactly four transport lines/);
 }
 assert.equal(add.batch_size,AUDIBLE_ADD_NEW_BATCH_SIZE);
 assert.equal(full.batch_size,AUDIBLE_ENRICH_BATCH_SIZE);
 assert.equal(covers.batch_size,AUDIBLE_COVER_BATCH_SIZE);
});

test('cover-only request is compact, self-contained, patch-based, and capped at 50 records',()=>{
 const identities=library.slice(0,55).map(audibleTargetIdentity);
 const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:identities,targetFields:[AUDIBLE_COVER_TARGET]});
 assert.equal(request.existing_records.length,50);assert.equal(request.expected_record_count,50);assert.deepEqual(request.target_fields,[AUDIBLE_COVER_TARGET]);
 assert.equal(request.existing_records[0].fizz_record_id,'fizz-1');assert.equal('description' in request.existing_records[0],false);assert.equal('runtime_minutes' in request.existing_records[0],false);
 assert.match(request.instructions.rules.join('\n'),/PATCH SEMANTICS/);assert.match(request.instructions.rules.join('\n'),/Do not return or modify unrelated audiobook metadata/);
});


test('complete 50-record cover-only encoded response validates as a stateless targeted transaction',async()=>{
 const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:library.slice(0,50).map(audibleTargetIdentity),targetFields:[AUDIBLE_COVER_TARGET]});
 const rows=library.slice(0,50).map((b,i)=>({media_type:'audiobook',fizz_record_id:b.audiobook_id,audible_asin:b.audible_asin,cover_image_url:i%7===0?null:`https://m.media-amazon.com/images/I/cover${i}.jpg`,source_evidence:i%7===0?'No exact cover':'Exact ASIN cover'}));
 const parsed=await parseAudibleUniversalResponse(await encodeAudibleTransport(responseFor(request,rows)));const validated=validateAudibleBatchResponse(parsed.payload);const planned=validateAudibleImportAgainstLibrary(validated,library);
 assert.equal(planned.audiobooks.length,50);assert.deepEqual(planned.target_fields,[AUDIBLE_COVER_TARGET]);assert.equal(planned.audiobooks[49].resolved_audiobook_id,'fizz-50');
});

test('universal importer accepts a valid encoded response without matching current request state',async()=>{
 const request=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:library.slice(0,10).map(b=>({...b,media_type:'audiobook'}))});
 const rows=library.slice(0,10).map(b=>({media_type:'audiobook',fizz_record_id:b.audiobook_id,audible_asin:b.audible_asin,title:b.title,display_title:b.title,audible_product_url:b.audible_product_url,authors:['Author'],narrators:['Narrator'],series:null,runtime_minutes:600,runtime_display:'10h',description:'Enriched',cover_image_url:'https://m.media-amazon.com/images/I/new.jpg',ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true}));
 const transport=await encodeAudibleTransport(responseFor(request,rows));
 const parsed=await parseAudibleUniversalResponse(transport);const validated=validateAudibleBatchResponse(parsed.payload);const planned=validateAudibleImportAgainstLibrary(validated,library);
 assert.equal(parsed.transport,'encoded');assert.equal(planned.audiobooks.length,10);assert.equal(planned.audiobooks[0].resolved_audiobook_id,'fizz-1');
});


test('v1.4.17.30-style encoded enrichment response remains importable without original request context',async()=>{
 const rows=library.slice(0,10).map(b=>({media_type:'audiobook',audible_asin:b.audible_asin,title:b.title,display_title:b.title,audible_product_url:b.audible_product_url,authors:['Author'],narrators:['Narrator'],series:null,runtime_minutes:600,runtime_display:'10h',description:'Legacy encoded enrichment',cover_image_url:'https://m.media-amazon.com/images/I/legacy.jpg',ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true}));
 const payload={format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:'audible-enrich_existing-legacy',operation:AUDIBLE_OPERATION,mode:'enrich_existing',audiobooks:rows};
 const parsed=await parseAudibleUniversalResponse(await encodeAudibleTransport(payload));const validated=validateAudibleBatchResponse(parsed.payload);const planned=validateAudibleImportAgainstLibrary(validated,library);
 assert.equal(planned.audiobooks.length,10);assert.equal(planned.audiobooks[0].resolved_audiobook_id,'fizz-1');
});

test('universal importer keeps backward-compatible strict raw JSON support',async()=>{
 const request=buildAudibleBatchRequest({mode:'add_new'});const row={media_type:'audiobook',audible_asin:'B999999999',title:'Legacy New Book',authors:['A'],narrators:['N'],series:null,runtime_minutes:60,runtime_display:'1h',description:null,cover_image_url:null,ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true};
 const payload={...responseFor(request,[row]),expected_record_count:1,requested_asins:[]};delete payload.requested_asins;
 const parsed=await parseAudibleUniversalResponse(JSON.stringify(payload));const validated=validateAudibleBatchResponse(parsed.payload);const planned=validateAudibleImportAgainstLibrary(validated,library);
 assert.equal(parsed.transport,'legacy-json');assert.equal(planned.audiobooks[0].will_create,true);
});

test('identity conflicts are rejected and enrichment cannot create unknown ASINs',()=>{
 const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:[audibleTargetIdentity(library[0])],targetFields:[AUDIBLE_COVER_TARGET]});
 const patch={media_type:'audiobook',fizz_record_id:'fizz-1',audible_asin:library[1].audible_asin,cover_image_url:'https://m.media-amazon.com/images/I/c.jpg'};
 const payload=responseFor(request,[patch]);const validated=validateAudibleBatchResponse(payload);
 assert.throws(()=>validateAudibleImportAgainstLibrary(validated,library),/Identity conflict/);
 const unknown={...patch,fizz_record_id:null,audible_asin:'B888888888'};const unknownPayload={...payload,requested_asins:['B888888888'],audiobooks:[unknown]};
 assert.throws(()=>validateAudibleImportAgainstLibrary(validateAudibleBatchResponse(unknownPayload),library),/does not match an existing/);
});

test('targeted cover response rejects unrelated mutable fields and null cover remains a no-op',()=>{
 const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:[audibleTargetIdentity(library[0])],targetFields:[AUDIBLE_COVER_TARGET]});
 const bad={media_type:'audiobook',fizz_record_id:'fizz-1',audible_asin:library[0].audible_asin,cover_image_url:'https://m.media-amazon.com/images/I/c.jpg',runtime_minutes:777};
 assert.throws(()=>validateAudibleBatchResponse(responseFor(request,[bad])),/unrelated field runtime_minutes/);
 const noop={media_type:'audiobook',fizz_record_id:'fizz-1',audible_asin:library[0].audible_asin,cover_image_url:null,source_evidence:'No exact cover'};
 const planned=validateAudibleImportAgainstLibrary(validateAudibleBatchResponse(responseFor(request,[noop])),library);
 const runs=[];const tx={query:(sql,args)=>sql.includes('audiobook_id=?')?[{...library[0]}]:[{...library[0]}],run:(sql,args)=>runs.push([sql,args])};
 const result=upsertAudibleExchangeRecord(tx,planned.audiobooks[0],'2026-08-08T18:00:00Z',{mode:AUDIBLE_TARGETED_MODE,targetFields:[AUDIBLE_COVER_TARGET]});
 assert.deepEqual(result.changedFields,[]);assert.equal(runs.length,0);
});

test('cover-only persistence touches only cover columns and never unrelated metadata',()=>{
 const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:[audibleTargetIdentity(library[0])],targetFields:[AUDIBLE_COVER_TARGET]});
 const patch={media_type:'audiobook',fizz_record_id:'fizz-1',audible_asin:library[0].audible_asin,cover_image_url:'https://m.media-amazon.com/images/I/c.jpg',source_evidence:'Exact ASIN'};
 const planned=validateAudibleImportAgainstLibrary(validateAudibleBatchResponse(responseFor(request,[patch])),library);
 const runs=[];const tx={query:(sql,args)=>[{...library[0]}],run:(sql,args)=>runs.push([sql,args])};
 const result=upsertAudibleExchangeRecord(tx,planned.audiobooks[0],'2026-08-08T18:00:00Z',{mode:AUDIBLE_TARGETED_MODE,targetFields:[AUDIBLE_COVER_TARGET]});
 assert.deepEqual(result.changedFields,['cover_image_url']);assert.equal(runs.length,1);assert.match(runs[0][0],/SET cover_image_url=\?,cover_image_source=\?/);assert.doesNotMatch(runs[0][0],/description|runtime_minutes|title=/);
});

test('UI uses one stateless response parser and exposes the 50-cover targeted request',()=>{
 assert.match(modal,/parseAudibleUniversalResponse\(response\)/);assert.doesNotMatch(modal,/expectedRequestId/);assert.doesNotMatch(modal,/expectedAsins/);
 assert.match(modal,/Paste any supported Audible response/);assert.match(modal,/previous app session/);assert.match(modal,/Covers up to 50/);assert.match(modal,/audible-universal-library-import/);
});
