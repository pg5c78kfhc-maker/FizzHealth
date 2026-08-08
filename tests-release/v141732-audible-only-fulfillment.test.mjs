import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AUDIBLE_ADD_NEW_BATCH_SIZE,AUDIBLE_COVER_BATCH_SIZE,AUDIBLE_COVER_TARGET,AUDIBLE_ENRICH_BATCH_SIZE,
  AUDIBLE_TARGETED_MODE,audibleTargetIdentity,buildAudibleBatchRequest
} from '../src/audio/audibleExchange.js';

const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const modal=fs.readFileSync(new URL('../src/audio/AudibleExchangeModal.jsx',import.meta.url),'utf8');

const book=i=>({
  audiobook_id:`fizz-${i}`,
  audible_asin:`B${String(i).padStart(9,'0')}`,
  title:`Book ${i}`,
  audible_product_url:`https://www.audible.com/pd/Book-${i}-Audiobook/B${String(i).padStart(9,'0')}`,
  authors:'Author',
  narrators:'Narrator'
});
const library=Array.from({length:40},(_,i)=>book(i+1));
const joined=request=>request.instructions.rules.join('\n');

test('release advances to 1.4.17.32 with schema 147 unchanged',()=>{
  assert.equal(meta.version,'1.4.17.32');
  assert.equal(meta.schema_version,147);
  assert.equal(meta.build,'141732');
  assert.match(main,/const VERSION='1\.4\.17\.32'/);
  assert.match(main,/const BUILD_ID='141732'/);
});

test('cover-only targeted enrichment is capped at 25 records',()=>{
  assert.equal(AUDIBLE_COVER_BATCH_SIZE,25);
  const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:library.map(audibleTargetIdentity),targetFields:[AUDIBLE_COVER_TARGET]});
  assert.equal(request.batch_size,25);
  assert.equal(request.expected_record_count,25);
  assert.equal(request.existing_records.length,25);
  assert.equal(request.requested_asins.length,25);
  assert.match(modal,/Covers up to 25/);
  assert.doesNotMatch(modal,/Covers up to 50/);
});

test('every Audible request makes Audible.com the only catalog fulfillment source',()=>{
  const requests=[
    buildAudibleBatchRequest({mode:'add_new'}),
    buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:library.slice(0,AUDIBLE_ENRICH_BATCH_SIZE).map(audibleTargetIdentity)}),
    buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:library.map(audibleTargetIdentity),targetFields:[AUDIBLE_COVER_TARGET]})
  ];
  for(const request of requests){
    const rules=joined(request);
    assert.equal(request.instructions.recipient,'ChatGPT with access to the pasted Audible library capture and Audible.com');
    assert.match(rules,/AUDIBLE-ONLY FULFILLMENT IS REQUIRED/);
    assert.match(rules,/use Audible\.com as the authoritative and only catalog website/);
    assert.match(rules,/Do not search or use podcast directories/);
    assert.match(rules,/Do not broaden a failed Audible lookup into a general Internet search/);
    assert.match(rules,/Amazon-hosted media assets are acceptable only when .* exact matched Audible product page/);
  }
});

test('cover fulfillment requires the supplied exact Audible page and prohibits outside cover searching',()=>{
  const request=buildAudibleBatchRequest({mode:AUDIBLE_TARGETED_MODE,existingRecords:library.map(audibleTargetIdentity),targetFields:[AUDIBLE_COVER_TARGET]});
  const rules=joined(request);
  assert.match(rules,/COVER ART PROCEDURE: For each submitted audiobook, open the supplied Audible product URL first/);
  assert.match(rules,/Confirm the page matches the submitted Audible ASIN/);
  assert.match(rules,/Inspect the exact Audible product page for the displayed cover and cover references in page metadata/);
  assert.match(rules,/Do not search outside Audible for cover artwork/);
  assert.match(rules,/Do not fabricate, predict, or reverse-engineer an image URL/);
  assert.match(rules,/For source_evidence, state the exact Audible product URL checked/);
});

test('existing transport and full-enrichment batch sizes remain unchanged',()=>{
  assert.equal(AUDIBLE_ENRICH_BATCH_SIZE,10);
  assert.equal(AUDIBLE_ADD_NEW_BATCH_SIZE,50);
  const full=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:library.slice(0,10).map(audibleTargetIdentity)});
  assert.equal(full.batch_size,10);
  assert.equal(full.response_requirements.encoding,'base64-utf8');
  assert.equal(full.response_requirements.checksum,'sha256');
  assert.equal(full.response_requirements.stateless_import,true);
});
