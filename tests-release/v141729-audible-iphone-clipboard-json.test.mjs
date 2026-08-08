import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_EXCHANGE_FORMAT,AUDIBLE_EXCHANGE_SCHEMA_VERSION,AUDIBLE_RESPONSE_TYPE,AUDIBLE_OPERATION,buildAudibleBatchRequest,normalizeAudibleClipboardJson,parseAudibleExchangeJson,validateAudibleBatchResponse} from '../src/audio/audibleExchange.js';

const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const modal=fs.readFileSync(new URL('../src/audio/AudibleExchangeModal.jsx',import.meta.url),'utf8');

const records=Array.from({length:10},(_,i)=>({
 media_type:'audiobook',audible_asin:`B${String(i+1).padStart(9,'0')}`,title:`Book ${i+1} — “Edition”`,display_title:`Book ${i+1} — “Edition”`,audible_product_url:`https://www.audible.com/pd/B${String(i+1).padStart(9,'0')}`,authors:[`O'Reilly Author ${i+1}`],narrators:['Narrator'],series:null,runtime_minutes:600+i,runtime_display:`10h ${i}m`,description:`A description with legitimate “curly quotes”, an escaped ASCII quote: "quoted", an apostrophe, and Unicode — punctuation.`,cover_image_url:null,ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true,source_evidence:null
}));
const request=buildAudibleBatchRequest({mode:'enrich_existing',existingRecords:records});
const response={format:AUDIBLE_EXCHANGE_FORMAT,schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,request_type:AUDIBLE_RESPONSE_TYPE,request_id:request.request_id,operation:AUDIBLE_OPERATION,mode:'enrich_existing',audiobooks:records};
const asins=records.map(r=>r.audible_asin);

function structuralQuotesToCurly(json){
 let out='',inString=false,escaped=false;
 for(let i=0;i<json.length;i++){
  const ch=json[i];
  if(inString){
   if(escaped){out+=ch;escaped=false;continue}
   if(ch==='\\'){out+=ch;escaped=true;continue}
   if(ch==='"'){out+='”';inString=false;continue}
   out+=ch;continue;
  }
  if(ch==='"'){out+='“';inString=true;continue}
  out+=ch;
 }
 return out;
}

function validate(text){
 const parsed=parseAudibleExchangeJson(text);
 const payload=validateAudibleBatchResponse(parsed.payload,{expectedRequestId:request.request_id,maxRecords:50,expectedMode:'enrich_existing',expectedRecordCount:10,expectedAsins:asins});
 return {...parsed,payload};
}

test('release advances to 1.4.17.29 with schema 147 unchanged',()=>{
 assert.equal(meta.version,'1.4.17.29');assert.equal(meta.schema_version,147);
 assert.match(main,/const VERSION='1\.4\.17\.29'/);assert.match(main,/const BUILD_ID='141729'/);
});

test('pristine ASCII JSON remains unchanged and validates',()=>{
 const text=JSON.stringify(response);const result=validate(text);
 assert.equal(result.clipboardCorrected,false);assert.equal(result.normalized,text);assert.equal(result.payload.audiobooks.length,10);
});

test('structural smart quotes are normalized while legitimate curly quotes inside metadata are preserved',()=>{
 const curly=structuralQuotesToCurly(JSON.stringify(response));const result=validate(curly);
 assert.equal(result.clipboardCorrected,true);assert.ok(result.clipboardCorrections>0);
 assert.equal(result.payload.audiobooks[0].title,'Book 1 — “Edition”');
 assert.match(result.payload.audiobooks[0].description,/legitimate “curly quotes”/);
});

test('escaped ASCII quotes, apostrophes, and Unicode punctuation survive clipboard normalization',()=>{
 const special={...response,audiobooks:records.map((r,i)=>({...r,description:i===0?'He said \\"hello\\" to O\'Reilly — then wrote “done”.':r.description}))};
 const curly=structuralQuotesToCurly(JSON.stringify(special));const result=validate(curly);
 assert.equal(result.payload.audiobooks[0].description,'He said \\"hello\\" to O\'Reilly — then wrote “done”.');
});

test('deliberately truncated smart-quote JSON is detected and blocked',()=>{
 const curly=structuralQuotesToCurly(JSON.stringify(response));const truncated=curly.slice(0,-25);
 assert.throws(()=>parseAudibleExchangeJson(truncated),/does not end with \}|appears incomplete|nothing imported/);
});

test('malformed JSON that normalization cannot legitimately repair remains blocked',()=>{
 const malformed='“format”:“fizz-health-audible-exchange”, “audiobooks”:[}';
 assert.throws(()=>parseAudibleExchangeJson(malformed),/Invalid JSON — nothing imported/);
});

test('normalizer reports whether clipboard formatting changed without permissive parsing',()=>{
 const pristine=normalizeAudibleClipboardJson(JSON.stringify(response));assert.equal(pristine.corrected,false);
 const curly=normalizeAudibleClipboardJson(structuralQuotesToCurly(JSON.stringify(response)));assert.equal(curly.corrected,true);
 assert.doesNotThrow(()=>JSON.parse(curly.text));
});

test('UI reports automatic clipboard correction and preserves strict validation/import gating',()=>{
 assert.match(modal,/Clipboard formatting corrected automatically/);
 assert.match(modal,/Strict JSON syntax and Audible schema validated/);
 assert.match(modal,/expectedRecordCount:expectedCount/);
 assert.match(modal,/expectedAsins:mode==='enrich_existing'\?expectedAsins:null/);
 assert.match(modal,/if\(!preview\|\|busy\)return/);
});
