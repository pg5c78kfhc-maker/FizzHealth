import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildAudibleBatchRequest,parseAudibleExchangeJson,validateAudibleBatchResponse,AUDIBLE_EXCHANGE_FORMAT,AUDIBLE_EXCHANGE_SCHEMA_VERSION,AUDIBLE_RESPONSE_TYPE,AUDIBLE_OPERATION} from '../src/audio/audibleExchange.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const meta=JSON.parse(fs.readFileSync(path.join(root,'VERSION.json'),'utf8'));
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const modal=fs.readFileSync(path.join(root,'src/audio/AudibleExchangeModal.jsx'),'utf8');
const db=fs.readFileSync(path.join(root,'src/database.js'),'utf8');

const existing=(asin,index)=>({media_type:'audiobook',audible_asin:asin,title:`Book ${index}`,display_title:`Book ${index}`,audible_product_url:`https://www.audible.com/pd/${asin}`,authors:['Author'],narrators:['Narrator'],series:null,runtime_minutes:null,runtime_display:null,description:`Description ${index} with a quoted phrase: \"safe JSON\".`,cover_image_url:null,ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null});
const asins=Array.from({length:50},(_,i)=>`B${String(i+1).padStart(9,'0')}`);
const responseFor=(request,records)=>({format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:request.request_id,operation:AUDIBLE_OPERATION,mode:request.mode,audiobooks:records});

test('release advances to 1.4.17.27 without schema increment',()=>{
 assert.equal(pkg.version,'1.4.17.27');assert.equal(meta.version,'1.4.17.27');assert.equal(meta.schema_version,147);
 assert.match(main,/const VERSION='1\.4\.17\.27'/);assert.match(main,/const BUILD_ID='141727'/);assert.match(db,/const TARGET_SCHEMA_VERSION=147/);
});

test('generated enrichment request puts strict JSON rules first and encodes exact batch invariants',()=>{
 const records=asins.map(existing);const request=buildAudibleBatchRequest({mode:'enrich_existing',batchSize:50,existingRecords:records});
 assert.match(request.instructions.rules[0],/STRICT OUTPUT FORMAT/);
 assert.ok(request.instructions.rules.some(rule=>rule.includes('JSON.parse()')));
 assert.ok(request.instructions.rules.some(rule=>rule.includes('Return exactly 50 audiobook response records')));
 assert.equal(request.response_requirements.strict_json,true);
 assert.equal(request.response_requirements.json_parse_compatible,true);
 assert.equal(request.response_requirements.expected_record_count,50);
 assert.equal(request.response_requirements.preserve_input_order,true);
 assert.equal(request.response_requirements.require_unique_asins,true);
});

test('strict parser accepts a complete 50-record JSON object including escaped quotes',()=>{
 const records=asins.map(existing);const request=buildAudibleBatchRequest({mode:'enrich_existing',batchSize:50,existingRecords:records});
 const text=JSON.stringify(responseFor(request,records));
 const {payload,normalized}=parseAudibleExchangeJson(`  \n${text}\n `);
 assert.equal(normalized[0],'{');assert.equal(normalized.at(-1),'}');
 const validated=validateAudibleBatchResponse(payload,{expectedRequestId:request.request_id,maxRecords:50,expectedMode:'enrich_existing',expectedRecordCount:50,expectedAsins:asins});
 assert.equal(validated.audiobooks.length,50);
});

test('strict parser rejects fences and commentary rather than silently extracting or repairing JSON',()=>{
 const request=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:[existing(asins[0],0)]});
 const text=JSON.stringify(responseFor(request,[existing(asins[0],0)]));
 assert.throws(()=>parseAudibleExchangeJson(`Here is the JSON:\n${text}`),/must begin with \{/);
 assert.throws(()=>parseAudibleExchangeJson(`\`\`\`json\n${text}\n\`\`\``),/must begin with \{/);
});

test('malformed and truncated JSON reports parser details and imports nothing',()=>{
 const malformed='{"format":"fizz-health-audible-exchange","audiobooks":[{"description":"bad "quote" here"}]}';
 assert.throws(()=>parseAudibleExchangeJson(malformed),/Invalid JSON — nothing imported/);
 const truncated='{"format":"fizz-health-audible-exchange","audiobooks":[{"title":"Book"}';
 assert.throws(()=>parseAudibleExchangeJson(truncated),/does not end with \}|appears incomplete/);
 assert.match(modal,/Validation failed:/);assert.match(modal,/Strict JSON syntax and Audible schema validated/);
});

test('schema stage rejects incomplete, duplicate, extra, or reordered enrichment batches after syntax succeeds',()=>{
 const records=asins.slice(0,3).map(existing);const request=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:records,batchSize:50});
 const opts={expectedRequestId:request.request_id,maxRecords:50,expectedMode:'enrich_existing',expectedRecordCount:3,expectedAsins:asins.slice(0,3)};
 assert.throws(()=>validateAudibleBatchResponse(responseFor(request,records.slice(0,2)),opts),/Incomplete batch/);
 assert.throws(()=>validateAudibleBatchResponse(responseFor(request,[records[0],records[0],records[2]]),opts),/Duplicate ASIN/);
 assert.throws(()=>validateAudibleBatchResponse(responseFor(request,[records[1],records[0],records[2]]),opts),/ASIN\/order mismatch/);
});
