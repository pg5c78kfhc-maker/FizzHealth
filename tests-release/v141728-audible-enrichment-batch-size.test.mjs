import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_ADD_NEW_BATCH_SIZE,AUDIBLE_ENRICH_BATCH_SIZE,buildAudibleBatchRequest} from '../src/audio/audibleExchange.js';

const modal=fs.readFileSync(new URL('../src/audio/AudibleExchangeModal.jsx',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const records=Array.from({length:10},(_,i)=>({media_type:'audiobook',audible_asin:`B${String(i+1).padStart(9,'0')}`,title:`Book ${i+1}`}));

test('release advances to 1.4.17.28 without schema change',()=>{
 assert.equal(meta.version,'1.4.17.28');
 assert.equal(meta.schema_version,147);
 assert.match(main,/const VERSION='1\.4\.17\.28'/);
 assert.match(main,/const BUILD_ID='141728'/);
});

test('enrichment batch constant is 10 while add-new remains 50',()=>{
 assert.equal(AUDIBLE_ENRICH_BATCH_SIZE,10);
 assert.equal(AUDIBLE_ADD_NEW_BATCH_SIZE,50);
 const enrich=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:records});
 assert.equal(enrich.batch_size,10);
 assert.equal(enrich.existing_records.length,10);
 assert.equal(enrich.response_requirements.expected_record_count,10);
 assert.ok(enrich.instructions.rules.some(rule=>rule.includes('10 existing records were submitted')));
 const add=buildAudibleBatchRequest({mode:'add_new'});
 assert.equal(add.batch_size,50);
 assert.equal(add.response_requirements.expected_record_count,50);
});

test('partial final enrichment batch requires its actual submitted count',()=>{
 const partial=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:records.slice(0,3)});
 assert.equal(partial.batch_size,10);
 assert.equal(partial.response_requirements.expected_record_count,3);
 assert.ok(partial.instructions.rules.some(rule=>rule.includes('3 existing records were submitted')));
});

test('Audible exchange UI caps enrichment selection at 10 and retains 50-book add-new workflow',()=>{
 assert.match(modal,/slice\(0,AUDIBLE_ENRICH_BATCH_SIZE\)/);
 assert.match(modal,/Enrich 10 incomplete/);
 assert.match(modal,/AUDIBLE_ENRICH_BATCH_SIZE:AUDIBLE_ADD_NEW_BATCH_SIZE/);
 assert.match(modal,/New 50-book batch/);
});
