import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {AUDIBLE_EXISTING_UPDATE_SQL,buildExistingAudibleUpdateParams,upsertAudibleExchangeBook} from '../src/audio/audibleExchangePersistence.js';
import {validateAudibleBatchResponse} from '../src/audio/audibleExchange.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const db=fs.readFileSync(path.join(root,'src/database.js'),'utf8');
const modal=fs.readFileSync(path.join(root,'src/audio/AudibleExchangeModal.jsx'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const meta=JSON.parse(fs.readFileSync(path.join(root,'VERSION.json'),'utf8'));
const placeholderCount=sql=>(sql.match(/\?/g)||[]).length;

const now='2026-08-08T16:10:00-04:00';
const baseRecord={
 media_type:'audiobook',audible_asin:'B09HVWR3V6',title:'22 Seconds',display_title:'22 Seconds',raw_title:null,
 audible_product_url:'https://www.audible.com/pd/22-Seconds-Audiobook/B09HVWR3V6',runtime_minutes:496,runtime_display:'8h 16m',
 description:null,description_is_truncated:0,cover_image_url:'https://m.media-amazon.com/images/I/example._SL500_.jpg',ownership_status:'owned',
 listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:1,authors:[],narrators:[],series:null
};
const existing={audiobook_id:'audible-book-b09hvwr3v6',audible_asin:'B09HVWR3V6',title:'22 Seconds',display_title:'22 Seconds',raw_title:null,
 audible_product_url:'https://www.audible.com/pd/22-Seconds-Audiobook/B09HVWR3V6',runtime_minutes:null,runtime_display:null,description:'Existing description',description_is_truncated:0,
 cover_image_url:null,cover_image_source:null,series_id:null,series_position:null,in_audible_library:1,owned_in_audible:1,ownership_status:'owned',audible_progress_text:'Finished',remaining_minutes:null,listening_status:'finished',can_listen_now:1};

test('release advances to 1.4.17.26 without schema increment',()=>{
 assert.equal(pkg.version,'1.4.17.26');assert.equal(meta.version,'1.4.17.26');assert.equal(meta.schema_version,147);
 assert.match(main,/const VERSION='1\.4\.17\.26'/);assert.match(main,/const BUILD_ID='141726'/);assert.match(db,/const TARGET_SCHEMA_VERSION=147/);
});

test('existing-record UPDATE has one bind value per placeholder and persists cover plus runtime',()=>{
 const params=buildExistingAudibleUpdateParams(existing,baseRecord,{seriesId:null,now});
 assert.equal(placeholderCount(AUDIBLE_EXISTING_UPDATE_SQL),22);
 assert.equal(params.length,22);
 assert.equal(params[4],496); // runtime_minutes
 assert.equal(params[8],baseRecord.cover_image_url); // cover_image_url
 assert.equal(params[9],'chatgpt-json-exchange');
 assert.equal(params.at(-1),existing.audiobook_id);
});

test('existing enrichment preserves non-null metadata, owned state, and explicit finished status',()=>{
 const incoming={...baseRecord,title:'Different incoming title',description:'Replacement description',ownership_status:'not_owned',listening_status:'unknown',can_listen_now:0};
 const params=buildExistingAudibleUpdateParams(existing,incoming,{seriesId:null,now});
 assert.equal(params[0],existing.title);
 assert.equal(params[6],existing.description);
 assert.equal(params[12],1); // in_audible_library
 assert.equal(params[13],1); // owned_in_audible
 assert.equal(params[14],'owned');
 assert.equal(params[17],'finished');
 assert.equal(params[18],1);
});

test('existing-only upsert executes corrected UPDATE without the former out-of-range bind',()=>{
 const calls=[];
 const tx={query(sql){if(sql.includes('FROM audible_audiobooks'))return [existing];return [];},run(sql,params=[]){calls.push({sql,params});assert.equal(placeholderCount(sql),params.length,`bind mismatch for ${sql}`)}};
 const result=upsertAudibleExchangeBook(tx,baseRecord,now);
 assert.deepEqual(result,{bookId:existing.audiobook_id,wasNew:false});
 const update=calls.find(call=>call.sql===AUDIBLE_EXISTING_UPDATE_SQL);assert.ok(update);assert.equal(update.params[4],496);assert.equal(update.params[8],baseRecord.cover_image_url);
});

test('new-record path remains parameter-aligned and returns wasNew true',()=>{
 const calls=[];
 const record={...baseRecord,audible_asin:'B000000001',title:'New Book',display_title:'New Book',cover_image_url:null,runtime_minutes:600,authors:[{name:'Test Author',audible_id:null,audible_url:null}],narrators:[{name:'Test Narrator',audible_id:null,audible_url:null}]};
 const tx={query(){return [];},run(sql,params=[]){calls.push({sql,params});assert.equal(placeholderCount(sql),params.length,`bind mismatch for ${sql}`)}};
 const result=upsertAudibleExchangeBook(tx,record,now);assert.equal(result.wasNew,true);
 assert.ok(calls.some(call=>call.sql.startsWith('INSERT INTO audible_audiobooks(')));
 assert.ok(calls.some(call=>call.sql.includes('audible_audiobook_authors')));
 assert.ok(calls.some(call=>call.sql.includes('audible_audiobook_narrators')));
});

test('payload validation still rejects duplicate ASINs and malformed covers before import',()=>{
 const payload={format:'fizz-health-audible-exchange',schema_version:1,request_type:'audible_library_batch_response',request_id:'test',operation:'upsert_audiobooks',audiobooks:[baseRecord,{...baseRecord}]};
 assert.throws(()=>validateAudibleBatchResponse(payload),/Duplicate ASIN/);
 const malformed={...payload,audiobooks:[{...baseRecord,cover_image_url:'http://example.com/cover.jpg'}]};
 assert.throws(()=>validateAudibleBatchResponse(malformed),/non-HTTPS cover_image_url/);
 assert.match(modal,/await transaction\(/);assert.match(modal,/No partial batch was retained/);assert.match(modal,/primeAudibleCoverCache\(refreshed\)/);
});
