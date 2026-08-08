import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AUDIBLE_EXCHANGE_FORMAT,AUDIBLE_EXCHANGE_SCHEMA_VERSION,AUDIBLE_OPERATION,AUDIBLE_RESPONSE_TYPE,
  AUDIBLE_TARGETED_MODE,validateAudibleBatchResponse
} from '../src/audio/audibleExchange.js';

const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const makeAsin=i=>`B${String(i).padStart(9,'0')}`;
const addRow=i=>({media_type:'audiobook',audible_asin:makeAsin(i),title:`Book ${i}`,authors:['Author'],narrators:['Narrator'],ownership_status:'owned',listening_status:'unknown',can_listen_now:true});
const base=(mode,audiobooks,requested_asins,expected_record_count=audiobooks.length)=>({format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:`req-${mode}`,operation:AUDIBLE_OPERATION,mode,expected_record_count,requested_asins,target_fields:mode===AUDIBLE_TARGETED_MODE?['cover_image_url']:[],audiobooks});

test('release advances to 1.4.17.33 with schema 147 unchanged',()=>{
  assert.equal(meta.version,'1.4.17.33');
  assert.equal(meta.schema_version,147);
  assert.equal(meta.build,'141733');
  assert.match(main,/const VERSION='1\.4\.17\.33'/);
  assert.match(main,/const BUILD_ID='141733'/);
});

test('add_new accepts 50 unique ASIN records when requested_asins is intentionally empty',()=>{
  const rows=Array.from({length:50},(_,i)=>addRow(i+1));
  const validated=validateAudibleBatchResponse(base('add_new',rows,[],50));
  assert.equal(validated.audiobooks.length,50);
  assert.equal(new Set(validated.audiobooks.map(row=>row.audible_asin)).size,50);
});

test('add_new uses expected_record_count for completeness and never derives expected zero from empty requested_asins',()=>{
  const rows=Array.from({length:49},(_,i)=>addRow(i+1));
  assert.throws(()=>validateAudibleBatchResponse(base('add_new',rows,[],50)),/Expected 50 audiobook records; received 49/);
});

test('add_new still rejects invalid or duplicate Audible ASINs',()=>{
  const rows=[addRow(1),addRow(1)];
  assert.throws(()=>validateAudibleBatchResponse(base('add_new',rows,[],2)),/Duplicate ASIN/);
  assert.throws(()=>validateAudibleBatchResponse(base('add_new',[{...addRow(2),audible_asin:null}],[],1)),/invalid Audible ASIN/);
});

test('targeted enrichment still requires exact ASIN order and complete reconciliation',()=>{
  const requested=Array.from({length:25},(_,i)=>makeAsin(i+1));
  const rows=requested.map((asin,i)=>({media_type:'audiobook',fizz_record_id:`fizz-${i+1}`,audible_asin:asin,cover_image_url:null,source_evidence:'Exact Audible page checked'}));
  assert.equal(validateAudibleBatchResponse(base(AUDIBLE_TARGETED_MODE,rows,requested,25)).audiobooks.length,25);
  const swapped=[...rows]; [swapped[0],swapped[1]]=[swapped[1],swapped[0]];
  assert.throws(()=>validateAudibleBatchResponse(base(AUDIBLE_TARGETED_MODE,swapped,requested,25)),/ASIN\/order mismatch/);
  assert.throws(()=>validateAudibleBatchResponse(base(AUDIBLE_TARGETED_MODE,rows.slice(0,24),requested,24)),/Incomplete ASIN reconciliation/);
});
