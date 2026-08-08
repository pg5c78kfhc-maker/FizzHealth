import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 AUDIBLE_EXCHANGE_FORMAT,AUDIBLE_EXCHANGE_SCHEMA_VERSION,AUDIBLE_RESPONSE_TYPE,AUDIBLE_OPERATION,
 AUDIBLE_TRANSPORT_FORMAT,AUDIBLE_TRANSPORT_ENCODING,buildAudibleBatchRequest,encodeAudibleTransport,
 parseAudibleEncodedResponse,parseAudibleTransportEnvelope,validateAudibleBatchResponse
} from '../src/audio/audibleExchange.js';

const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const modal=fs.readFileSync(new URL('../src/audio/AudibleExchangeModal.jsx',import.meta.url),'utf8');

const records=Array.from({length:10},(_,i)=>({
 media_type:'audiobook',audible_asin:`B${String(i+1).padStart(9,'0')}`,title:`Book ${i+1} — “Edition”`,display_title:`Book ${i+1} — “Edition”`,audible_product_url:`https://www.audible.com/pd/B${String(i+1).padStart(9,'0')}`,
 authors:[`O'Reilly Author ${i+1}`],narrators:['Narrator'],series:null,runtime_minutes:600+i,runtime_display:`10h ${i}m`,description:`Catalog text with “curly quotes”, an embedded ASCII quote: "quoted", an apostrophe, ellipsis… and em dash — preserved after decoding.`,cover_image_url:`https://m.media-amazon.com/images/I/test${i}.jpg`,ownership_status:'owned',listening_status:i===0?'finished':'unknown',audible_progress_text:i===0?'Finished':null,remaining_minutes:null,can_listen_now:true,source_evidence:'Exact ASIN match.'
}));
const request=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:records});
const response={format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:request.request_id,operation:AUDIBLE_OPERATION,mode:'enrich_existing',audiobooks:records};
const asins=records.map(r=>r.audible_asin);

async function decodeAndValidate(transport,overrides={}){
 const parsed=await parseAudibleEncodedResponse(transport);
 return validateAudibleBatchResponse(parsed.payload,{expectedRequestId:request.request_id,maxRecords:50,expectedMode:'enrich_existing',expectedRecordCount:10,expectedAsins:asins,...overrides});
}

test('release advances to 1.4.17.30 with schema 147 unchanged',()=>{
 assert.equal(meta.version,'1.4.17.30');assert.equal(meta.schema_version,147);
 assert.match(main,/const VERSION='1\.4\.17\.30'/);assert.match(main,/const BUILD_ID='141730'/);
});

test('enrichment request requires the four-line Base64 UTF-8 SHA-256 transport and keeps 10-record validation',()=>{
 assert.equal(request.batch_size,10);assert.equal(request.response_requirements.expected_record_count,10);
 assert.equal(request.response_requirements.transport_format,AUDIBLE_TRANSPORT_FORMAT);
 assert.equal(request.response_requirements.encoding,AUDIBLE_TRANSPORT_ENCODING);
 assert.equal(request.response_requirements.checksum,'sha256');
 assert.match(request.instructions.rules.join('\n'),/Do not return the enrichment response as raw JSON/);
 assert.match(request.instructions.rules.join('\n'),/Return exactly four transport lines/);
});

test('complete 10-book Unicode response round-trips byte-for-byte through encoded transport',async()=>{
 const transport=await encodeAudibleTransport(response);
 assert.match(transport,new RegExp(`^${AUDIBLE_TRANSPORT_FORMAT}\\nencoding=${AUDIBLE_TRANSPORT_ENCODING}\\nsha256=[a-f0-9]{64}\\npayload=[A-Za-z0-9+/]+=*$`));
 const parsed=await parseAudibleEncodedResponse(transport);
 assert.equal(parsed.checksumVerified,true);
 assert.equal(parsed.decoded,JSON.stringify(response));
 const validated=await decodeAndValidate(transport);
 assert.equal(validated.audiobooks.length,10);
 assert.equal(validated.audiobooks[0].title,'Book 1 — “Edition”');
 assert.match(validated.audiobooks[0].description,/“curly quotes”/);
 assert.match(validated.audiobooks[0].description,/O'Reilly|embedded ASCII quote/);
 assert.match(validated.audiobooks[0].description,/ellipsis… and em dash —/);
});

test('truncated Base64 is rejected before audiobook validation',async()=>{
 const transport=await encodeAudibleTransport(response);const truncated=transport.slice(0,-7);
 await assert.rejects(()=>parseAudibleEncodedResponse(truncated),/Base64|incomplete|corrupted|Nothing imported/);
});

test('decodable altered payload is rejected by SHA-256 checksum',async()=>{
 const transport=await encodeAudibleTransport(response);const envelope=parseAudibleTransportEnvelope(transport);
 const chars=envelope.payload.split('');const idx=Math.floor(chars.length/2);chars[idx]=chars[idx]==='A'?'B':'A';
 const changed=`${AUDIBLE_TRANSPORT_FORMAT}\nencoding=${AUDIBLE_TRANSPORT_ENCODING}\nsha256=${envelope.sha256}\npayload=${chars.join('')}`;
 await assert.rejects(()=>parseAudibleEncodedResponse(changed),/Checksum mismatch/);
});

test('valid transport containing malformed decoded JSON is rejected strictly',async()=>{
 const transport=await encodeAudibleTransport('{"format":"broken"');
 await assert.rejects(()=>parseAudibleEncodedResponse(transport),/Decoded response is not valid JSON/);
});

test('valid encoded JSON still rejects wrong request id and missing or duplicate ASINs',async()=>{
 const wrong=await encodeAudibleTransport({...response,request_id:'audible-other'});
 await assert.rejects(()=>decodeAndValidate(wrong),/different Audible exchange request/);
 const missing=await encodeAudibleTransport({...response,audiobooks:response.audiobooks.slice(0,9)});
 await assert.rejects(()=>decodeAndValidate(missing),/Incomplete batch/);
 const duplicate=await encodeAudibleTransport({...response,audiobooks:response.audiobooks.map((r,i)=>i===9?{...r,audible_asin:response.audiobooks[0].audible_asin}:r)});
 await assert.rejects(()=>decodeAndValidate(duplicate),/Duplicate ASIN/);
});

test('Step 2 decodes and verifies enrichment transport before preview/import; add-new raw JSON path remains intact',()=>{
 assert.match(modal,/mode==='enrich_existing'\?await parseAudibleEncodedResponse\(response\):parseAudibleExchangeJson\(response\)/);
 assert.match(modal,/Encoded response decoded and SHA-256 checksum verified/);
 assert.match(modal,/expectedRecordCount:expectedCount/);
 assert.match(modal,/expectedAsins:mode==='enrich_existing'\?expectedAsins:null/);
 assert.match(modal,/if\(!preview\|\|busy\)return/);
 assert.match(modal,/await transaction\(/);
 assert.match(modal,/Paste the encoded ChatGPT response here/);
});
