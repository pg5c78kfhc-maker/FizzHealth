export const AUDIBLE_EXCHANGE_FORMAT='fizz-health-audible-exchange';
export const AUDIBLE_EXCHANGE_SCHEMA_VERSION=1;
export const AUDIBLE_REQUEST_TYPE='audible_library_batch_request';
export const AUDIBLE_RESPONSE_TYPE='audible_library_batch_response';
export const AUDIBLE_OPERATION='upsert_audiobooks';
export const AUDIBLE_ENRICH_BATCH_SIZE=10;
export const AUDIBLE_ADD_NEW_BATCH_SIZE=50;
export const AUDIBLE_COVER_BATCH_SIZE=25;
export const AUDIBLE_TARGETED_MODE='enrich_targeted';
export const AUDIBLE_COVER_TARGET='cover_image_url';
export const AUDIBLE_TRANSPORT_FORMAT='FIZZ_HEALTH_AUDIBLE_ENCODED_RESPONSE_V1';
export const AUDIBLE_TRANSPORT_ENCODING='base64-utf8';

const clean=value=>value==null?null:String(value).trim()||null;
const isHttps=value=>/^https:\/\//i.test(String(value||''));
const normalizeAsin=value=>String(value||'').trim().toUpperCase();
const normalizeStatus=value=>String(value||'unknown').trim().toLowerCase().replace(/[\s-]+/g,'_');
const allowedListening=new Set(['unknown','not_started','in_progress','finished']);
const allowedOwnership=new Set(['owned','not_owned','unknown']);

function stringList(value){
 if(value==null)return [];
 const rows=Array.isArray(value)?value:[value];
 return rows.map(item=>typeof item==='string'?{name:clean(item)}:{name:clean(item?.name),audible_id:clean(item?.audible_id||item?.id),audible_url:clean(item?.audible_url||item?.url)}).filter(item=>item.name);
}
function normalizedSeries(value){
 const raw=Array.isArray(value)?value[0]:value;
 if(!raw)return null;
 if(typeof raw==='string')return {name:clean(raw),audible_series_id:null,audible_url:null,position:null,total_known:null};
 const position=raw.position??raw.book_number??raw.series_position??null;
 return {name:clean(raw.name||raw.series_name),audible_series_id:clean(raw.audible_series_id||raw.id),audible_url:clean(raw.audible_url||raw.url),position:position==null||position===''?null:Number(position),total_known:raw.total_known==null?null:Number(raw.total_known)};
}
function lineColumn(text,position){
 const before=String(text).slice(0,Math.max(0,position));
 const lines=before.split('\n');
 return {line:lines.length,column:(lines.at(-1)||'').length+1};
}
function syntaxPosition(error){
 const message=String(error?.message||'');
 const match=message.match(/position\s+(\d+)/i)||message.match(/at\s+character\s+(\d+)/i);
 return match?Number(match[1]):null;
}
function syntaxContext(text,position){
 if(position==null||!Number.isFinite(position))return null;
 const source=String(text),start=Math.max(0,position-55),end=Math.min(source.length,position+55);
 return source.slice(start,end).replace(/\s+/g,' ').trim();
}
function structureHint(text){
 const source=String(text),stack=[];let inString=false,escaped=false;
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(inString){if(escaped){escaped=false;continue}if(ch==='\\'){escaped=true;continue}if(ch==='"')inString=false;continue}
  if(ch==='"'){inString=true;continue}
  if(ch==='{'||ch==='[')stack.push(ch);
  else if(ch==='}'||ch===']'){
   const open=stack.at(-1),valid=(open==='{'&&ch==='}')||(open==='['&&ch===']');
   if(valid)stack.pop();
  }
 }
 if(inString)return 'The response appears incomplete: a JSON string was not closed.';
 if(stack.length){const open=stack.at(-1);return `The response appears incomplete: an opening ${open==='{'?'object':'array'} was not closed.`}
 return null;
}
const CURLY_QUOTES=new Set(['“','”']);
function previousNonWhitespace(source,index){for(let i=index-1;i>=0;i--)if(!/\s/.test(source[i]))return source[i];return null}
function nextNonWhitespace(source,index){for(let i=index+1;i<source.length;i++)if(!/\s/.test(source[i]))return source[i];return null}
function curlyCanOpenString(source,index){const prev=previousNonWhitespace(source,index);return prev==null||prev==='{'||prev==='['||prev===','||prev===':'}
function curlyCanCloseString(source,index){const next=nextNonWhitespace(source,index);if(next==null||next===':'||next==='}'||next===']')return true;if(next!==',')return false;const comma=source.indexOf(',',index+1);if(comma<0)return false;const after=nextNonWhitespace(source,comma);return after==null||after==='}'||after===']'||after==='{'||after==='['||after==='"'||CURLY_QUOTES.has(after)||after==='-'||/[0-9tfn]/.test(after)}
export function normalizeAudibleClipboardJson(text=''){
 const source=String(text).replace(/^\uFEFF/,'').trim();
 let out='',inString=false,delimiter=null,escaped=false,corrections=0;
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(inString){
   if(escaped){out+=ch;escaped=false;continue}
   if(ch==='\\'){out+=ch;escaped=true;continue}
   if(delimiter==='ascii'){out+=ch;if(ch==='"'){inString=false;delimiter=null}continue}
   if(CURLY_QUOTES.has(ch)&&curlyCanCloseString(source,i)){out+='"';inString=false;delimiter=null;corrections++;continue}
   out+=ch;continue;
  }
  if(ch==='"'){out+=ch;inString=true;delimiter='ascii';continue}
  if(CURLY_QUOTES.has(ch)&&curlyCanOpenString(source,i)){out+='"';inString=true;delimiter='curly';corrections++;continue}
  out+=ch;
 }
 return {text:out,corrected:corrections>0,corrections};
}
export function normalizeAudibleExchangeJson(text=''){
 return normalizeAudibleClipboardJson(text).text;
}
export function audibleJsonSyntaxMessage(text,error){
 const normalized=normalizeAudibleExchangeJson(text),message=String(error?.message||error||'Unknown JSON syntax error.');
 const first=normalized[0]||'',last=normalized.at(-1)||'';
 if(first!=='{')return `Invalid JSON — nothing imported. The response must begin with { and contain no commentary, Markdown, or code fence before it. Parser: ${message}`;
 if(last!=='}')return `Invalid JSON — nothing imported. The response does not end with }. It may be truncated or contain trailing text. ${structureHint(normalized)||''} Parser: ${message}`.replace(/\s+/g,' ').trim();
 const position=syntaxPosition(error),where=position==null?'':(()=>{const lc=lineColumn(normalized,position);return ` Near character ${position} (line ${lc.line}, column ${lc.column}).`})();
 const context=syntaxContext(normalized,position),snippet=context?` Problem area: ${context}`:'';
 const hint=structureHint(normalized);return `Invalid JSON — nothing imported. Parser: ${message}.${where}${snippet}${hint?` ${hint}`:''}`.replace(/\.\./g,'.');
}
export function parseAudibleExchangeJson(text=''){
 const result=normalizeAudibleClipboardJson(text),normalized=result.text;
 if(!normalized)throw new Error('Paste the Audible JSON response first.');
 try{return {payload:JSON.parse(normalized),normalized,clipboardCorrected:result.corrected,clipboardCorrections:result.corrections}}
 catch(error){throw new Error(audibleJsonSyntaxMessage(normalized,error))}
}
function bytesToBase64(bytes){
 let binary='';const chunk=0x8000;
 for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+chunk)));
 return btoa(binary);
}
function base64ToBytes(value){
 const compact=String(value||'').replace(/\s+/g,'');
 if(!compact||compact.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(compact))throw new Error('Encoded response payload is not valid Base64. Nothing imported.');
 let binary;try{binary=atob(compact)}catch{throw new Error('Encoded response payload is not valid Base64. Nothing imported.')}
 const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 if(bytesToBase64(bytes)!==compact)throw new Error('Encoded response payload is not canonical Base64. It may be incomplete or corrupted. Nothing imported.');
 return bytes;
}
function bytesToHex(bytes){return [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
async function sha256Hex(bytes){
 if(!globalThis.crypto?.subtle)throw new Error('Secure checksum verification is unavailable on this device. Nothing imported.');
 return bytesToHex(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes)));
}
export async function encodeAudibleTransport(payload){
 const json=typeof payload==='string'?payload:JSON.stringify(payload),bytes=new TextEncoder().encode(json),sha256=await sha256Hex(bytes),base64=bytesToBase64(bytes);
 return `${AUDIBLE_TRANSPORT_FORMAT}\nencoding=${AUDIBLE_TRANSPORT_ENCODING}\nsha256=${sha256}\npayload=${base64}`;
}
export function parseAudibleTransportEnvelope(text=''){
 const source=String(text).replace(/^\uFEFF/,'').trim();
 if(!source)throw new Error('Paste the encoded Audible response first.');
 const lines=source.replace(/\r\n?/g,'\n').split('\n');
 if(lines[0].trim()!==AUDIBLE_TRANSPORT_FORMAT)throw new Error(`Invalid transport envelope. Expected ${AUDIBLE_TRANSPORT_FORMAT}. Nothing imported.`);
 let encoding=null,sha256=null,payload=null,payloadStarted=false;
 for(let i=1;i<lines.length;i++){
  const line=lines[i];
  if(payloadStarted){payload+=line.trim();continue}
  if(line.startsWith('encoding=')){if(encoding!=null)throw new Error('Invalid transport envelope: duplicate encoding field. Nothing imported.');encoding=line.slice(9).trim();continue}
  if(line.startsWith('sha256=')){if(sha256!=null)throw new Error('Invalid transport envelope: duplicate sha256 field. Nothing imported.');sha256=line.slice(7).trim().toLowerCase();continue}
  if(line.startsWith('payload=')){if(payload!=null)throw new Error('Invalid transport envelope: duplicate payload field. Nothing imported.');payload=line.slice(8).trim();payloadStarted=true;continue}
  if(line.trim())throw new Error(`Invalid transport envelope: unexpected line "${line.trim().slice(0,40)}". Nothing imported.`);
 }
 if(encoding!==AUDIBLE_TRANSPORT_ENCODING)throw new Error(`Invalid transport envelope encoding. Expected ${AUDIBLE_TRANSPORT_ENCODING}. Nothing imported.`);
 if(!/^[a-f0-9]{64}$/.test(String(sha256||'')))throw new Error('Invalid transport envelope checksum. Expected a 64-character SHA-256 hex digest. Nothing imported.');
 if(!payload)throw new Error('Encoded response payload is missing or incomplete. Nothing imported.');
 return {format:AUDIBLE_TRANSPORT_FORMAT,encoding,sha256,payload:String(payload).replace(/\s+/g,'')};
}
export async function parseAudibleEncodedResponse(text=''){
 const envelope=parseAudibleTransportEnvelope(text),bytes=base64ToBytes(envelope.payload),actualSha256=await sha256Hex(bytes);
 if(actualSha256!==envelope.sha256)throw new Error('Checksum mismatch. The encoded response changed or was incompletely copied. Nothing imported.');
 let decoded;try{decoded=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{throw new Error('Encoded response is not valid UTF-8. Nothing imported.')}
 let payload;try{payload=JSON.parse(decoded)}catch(error){throw new Error(`Decoded response is not valid JSON. Nothing imported. Parser: ${String(error?.message||error)}`)}
 return {payload,decoded,envelope,checksumVerified:true};
}

export async function parseAudibleUniversalResponse(text=''){
 const source=String(text||'').replace(/^\uFEFF/,'').trim();
 if(!source)throw new Error('Paste a Fizz Health Audible response first.');
 if(source.startsWith(AUDIBLE_TRANSPORT_FORMAT)){
  const parsed=await parseAudibleEncodedResponse(source);
  return {...parsed,transport:'encoded'};
 }
 const parsed=parseAudibleExchangeJson(source);
 return {...parsed,transport:'legacy-json',checksumVerified:false};
}

const TARGETABLE_FIELDS=new Set(['cover_image_url','description','runtime_minutes','runtime_display','series','authors','narrators','title','display_title','audible_product_url']);
const IDENTITY_FIELDS=new Set(['media_type','audible_asin','asin','fizz_record_id','audiobook_id','title','display_title','authors','narrators','audible_product_url','source_evidence']);
const hasOwn=(object,key)=>Object.prototype.hasOwnProperty.call(object||{},key);
const modeBatchLimit=mode=>mode===AUDIBLE_TARGETED_MODE?AUDIBLE_COVER_BATCH_SIZE:mode==='enrich_existing'?AUDIBLE_ENRICH_BATCH_SIZE:AUDIBLE_ADD_NEW_BATCH_SIZE;
const compactPeople=value=>String(value||'').split(' · ').map(item=>item.trim()).filter(Boolean);

export function audibleTargetIdentity(book={}){
 return {
  media_type:'audiobook',
  fizz_record_id:clean(book.audiobook_id),
  audible_asin:normalizeAsin(book.audible_asin),
  title:clean(book.title||book.display_title),
  audible_product_url:clean(book.audible_product_url),
  authors:compactPeople(book.authors),
  narrators:compactPeople(book.narrators)
 };
}

function transportRules(){
 return [
  'CLIPBOARD-SAFE RESPONSE TRANSPORT IS REQUIRED. Do not return the response as raw JSON.',
  `Return exactly four transport lines and nothing else. Line 1: ${AUDIBLE_TRANSPORT_FORMAT}. Line 2: encoding=${AUDIBLE_TRANSPORT_ENCODING}. Line 3: sha256=<64 lowercase hexadecimal SHA-256 of the exact decoded UTF-8 JSON bytes>. Line 4: payload=<Base64 of those exact UTF-8 JSON bytes>.`,
  'Do not return Markdown, code fences, commentary, citations, explanations, headings, prefixes, suffixes, or any other text.',
  'First construct the complete audible_library_batch_response object using strict JSON with ASCII U+0022 double quotation marks for JSON syntax.',
  'Before JSON serialization, sanitize catalog-derived text so punctuation cannot corrupt JSON, and JSON-escape embedded ASCII double quotes, backslashes, newlines, tabs, and control characters.',
  'Serialize the complete response JSON compactly, verify that the exact serialized JSON parses successfully with JavaScript JSON.parse(), then encode those exact UTF-8 bytes as Base64.',
  'Compute SHA-256 over the exact decoded UTF-8 JSON bytes represented by payload. The checksum must match those bytes exactly.',
  'The Base64 payload must contain the entire response JSON. Do not truncate it or split it into multiple objects.',
  'The transport envelope itself must contain only the four specified ASCII lines. Do not use quotation marks around envelope field values.'
 ];
}

export function buildAudibleBatchRequest({existingRecords=[],mode='add_new',batchSize=null,targetFields=null}={}){
 const targets=mode===AUDIBLE_TARGETED_MODE?(Array.isArray(targetFields)&&targetFields.length?targetFields:[AUDIBLE_COVER_TARGET]):[];
 const limit=modeBatchLimit(mode),resolvedBatch=Math.min(Number(batchSize)||limit,limit);
 const records=mode==='add_new'?[]:existingRecords.slice(0,resolvedBatch);
 const expectedRecordCount=mode==='add_new'?resolvedBatch:records.length;
 const requestId=`audible-${mode}-${Date.now()}`;
 const requestedAsins=records.map(row=>normalizeAsin(row.audible_asin)).filter(Boolean);
 const rules=[...transportRules(),
  'Preserve format, schema_version, request_id, operation, mode, expected_record_count, requested_asins, and target_fields when present, and set request_type to audible_library_batch_response.',
  'AUDIBLE-ONLY FULFILLMENT IS REQUIRED: For any catalog lookup, identity check, enrichment, metadata verification, or artwork lookup, use Audible.com as the authoritative and only catalog website.',
  'Do not search or use podcast directories, podcast websites, blogs, review sites, general web results, Google Books, Apple Books, Goodreads, publisher catalogs, retailer catalogs, or any other third-party site to fulfill an Audible exchange request.',
  'When an audible_product_url is supplied, open that exact Audible URL first and verify that it corresponds to the supplied Audible ASIN. When no product URL is supplied, locate the exact ASIN within Audible.com only.',
  'Do not broaden a failed Audible lookup into a general Internet search. If Audible cannot verify a requested value for the exact ASIN, return null for that value rather than sourcing it elsewhere.',
  'Amazon-hosted media assets are acceptable only when the direct asset is exposed by or directly associated with the exact matched Audible product page; do not perform a separate Amazon catalog search.',
  mode==='add_new'
   ?`This is an add-new request for up to ${resolvedBatch} audiobooks from the supplied Audible capture. Return the complete requested batch and authoritative Audible ASIN for every returned audiobook.`
   :`BATCH COMPLETENESS IS REQUIRED: ${expectedRecordCount} existing records were submitted. Return exactly ${expectedRecordCount} response records, one for every submitted ASIN, in the same order.`,
  mode===AUDIBLE_TARGETED_MODE
   ?`TARGETED ENRICHMENT: Only enrich these target fields: ${targets.join(', ')}. Return identity fields plus the requested target fields and source_evidence only. Do not return or modify unrelated audiobook metadata.`
   :'Do not silently omit an audiobook merely because some enrichment is unavailable; preserve submitted values and use null only where the requested value cannot be confidently verified.',
  mode===AUDIBLE_TARGETED_MODE
   ?'PATCH SEMANTICS: omitted fields mean no change. A null target value means no verified replacement was found and must not clear an existing Fizz Health value.'
   :'Preserve valid existing non-null metadata unless a confidently matched authoritative catalog record demonstrates that the existing value is incorrect.',
  'Audiobooks only. Exclude podcast shows, podcast episodes, music, and other non-audiobook audio.',
  'Use Audible ASIN as the authoritative catalog identity and never invent an ASIN.',
  'Preserve fizz_record_id on returned existing-record responses whenever it was supplied in the request; use Audible ASIN as the fallback identity when no Fizz record ID is available.',
  'Do not substitute a different edition, narration, abridgment, language, or product because it is easier to find.',
  'Populate only information supported by the supplied Audible capture or a confidently matched public catalog record.',
  'Unknown is null. Do not guess URLs, artwork, runtimes, series positions, authors, narrators, or other metadata.',
  ...(targets.includes(AUDIBLE_COVER_TARGET)?[
   'COVER ART PROCEDURE: For each submitted audiobook, open the supplied Audible product URL first. Confirm the page matches the submitted Audible ASIN, then identify the cover displayed for that exact audiobook edition.',
   'Inspect the exact Audible product page for the displayed cover and cover references in page metadata, including og:image, structured/JSON-LD image data, and the product image element or srcset when available. A direct HTTPS m.media-amazon.com image asset is acceptable only when it is exposed by or directly tied to that matched Audible page.',
   'Do not search outside Audible for cover artwork. Do not use podcast sites, unrelated catalogs, search-result pages, or a merely similar title. Do not fabricate, predict, or reverse-engineer an image URL.',
   'For cover_image_url, return only a direct HTTPS image URL confidently associated with the exact matched Audible ASIN; otherwise return null.',
   'For source_evidence, state the exact Audible product URL checked and whether the cover came from the Audible page or an image asset exposed by that page. If null, state that the exact Audible page was checked and did not yield a confidently usable direct cover URL.'
  ]:[]),
  ...(mode==='enrich_existing'?[
   'Actively attempt to enrich missing cover artwork and runtime while preserving ownership/listening state supplied by Fizz Health.',
   'runtime_minutes is the total audiobook runtime, not time remaining. When runtime is verified, populate runtime_minutes and runtime_display consistently.',
   'Preserve ownership_status, listening_status, audible_progress_text, and remaining_minutes from submitted existing records.'
  ]:[]),
  `Before Base64 encoding, verify the response contains ${mode==='add_new'?'no more than '+resolvedBatch:expectedRecordCount} audiobook records, contains no duplicate ASINs, and is strict valid JSON.`
 ];
 const responseRequirements={
  transport_format:AUDIBLE_TRANSPORT_FORMAT,encoding:AUDIBLE_TRANSPORT_ENCODING,checksum:'sha256',strict_json:true,json_parse_compatible:true,no_markdown:true,no_code_fences:true,no_commentary:true,
  identity_field:'audible_asin',expected_record_count:expectedRecordCount,preserve_input_order:mode!=='add_new',require_unique_asins:true,
  stateless_import:true,
  ...(requestedAsins.length?{requested_asins:requestedAsins}:{}),
  ...(targets.length?{target_fields:targets,patch_semantics:true}:{}),
 };
 const targetedSchema={media_type:'audiobook',fizz_record_id:null,audible_asin:null,source_evidence:null};
 for(const field of targets)targetedSchema[field]=(field==='authors'||field==='narrators')?[]:null;
 return {
  format:AUDIBLE_EXCHANGE_FORMAT,
  schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,
  request_type:AUDIBLE_REQUEST_TYPE,
  request_id:requestId,
  operation:AUDIBLE_OPERATION,
  mode,
  batch_size:resolvedBatch,
  expected_record_count:expectedRecordCount,
  requested_asins:requestedAsins,
  target_fields:targets,
  instructions:{
   recipient:'ChatGPT with access to the pasted Audible library capture and Audible.com',
   purpose:mode===AUDIBLE_TARGETED_MODE?`Enrich only ${targets.join(', ')} for these existing Fizz Health Audible audiobook records.`:mode==='enrich_existing'?'Enrich these existing Fizz Health Audible audiobook records without creating duplicates.':'Create a batch of Audible audiobook records for import into Fizz Health.',
   rules
  },
  response_requirements:responseRequirements,
  existing_records:records,
  audiobook_schema:mode===AUDIBLE_TARGETED_MODE
   ?targetedSchema
   :{media_type:'audiobook',fizz_record_id:null,audible_asin:null,title:null,display_title:null,audible_product_url:null,authors:[],narrators:[],series:null,runtime_minutes:null,runtime_display:null,description:null,cover_image_url:null,ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true,source_evidence:null},
  audiobooks:[]
 };
}

function normalizedTargetFields(payload){
 const fields=Array.isArray(payload?.target_fields)?payload.target_fields.map(field=>String(field||'').trim()).filter(Boolean):[];
 for(const field of fields)if(!TARGETABLE_FIELDS.has(field))throw new Error(`Unsupported targeted enrichment field ${field}.`);
 return [...new Set(fields)];
}

export function validateAudibleBatchResponse(payload,{expectedRequestId=null,maxRecords=null,expectedMode=null,expectedRecordCount=null,expectedAsins=null}={}){
 if(!payload||payload.format!==AUDIBLE_EXCHANGE_FORMAT)throw new Error('Not a Fizz Health Audible exchange.');
 if(Number(payload.schema_version)!==AUDIBLE_EXCHANGE_SCHEMA_VERSION)throw new Error(`Expected Audible exchange schema v${AUDIBLE_EXCHANGE_SCHEMA_VERSION}.`);
 if(payload.request_type!==AUDIBLE_RESPONSE_TYPE)throw new Error(`Expected request_type ${AUDIBLE_RESPONSE_TYPE}.`);
 if(payload.operation!==AUDIBLE_OPERATION)throw new Error(`Expected operation ${AUDIBLE_OPERATION}.`);
 const mode=String(payload.mode||'add_new');
 if(!['add_new','enrich_existing',AUDIBLE_TARGETED_MODE].includes(mode))throw new Error(`Unsupported Audible exchange mode ${mode||'(missing)'}.`);
 if(expectedMode&&mode!==String(expectedMode))throw new Error(`Expected Audible exchange mode ${expectedMode}.`);
 if(expectedRequestId&&String(payload.request_id)!==String(expectedRequestId))throw new Error('The response belongs to a different Audible exchange request.');
 if(!clean(payload.request_id))throw new Error('The Audible response is missing request_id provenance.');
 if(!Array.isArray(payload.audiobooks))throw new Error('The exchange is missing the audiobooks array.');
 if(payload.audiobooks.length===0)throw new Error('The Audible exchange contains no audiobook records.');
 const limit=maxRecords==null?modeBatchLimit(mode):Number(maxRecords);
 if(payload.audiobooks.length>limit)throw new Error(`This ${mode} importer accepts at most ${limit} audiobook records per batch.`);
 const selfExpected=payload.expected_record_count==null?null:Number(payload.expected_record_count);
 const requiredCount=expectedRecordCount==null?selfExpected:Number(expectedRecordCount);
 if(requiredCount!=null&&(!Number.isInteger(requiredCount)||requiredCount<1||requiredCount>limit))throw new Error('The response has an invalid expected_record_count.');
 if(requiredCount!=null&&payload.audiobooks.length!==requiredCount)throw new Error(`Expected ${requiredCount} audiobook records; received ${payload.audiobooks.length}. Nothing imported.`);
 const targetFields=mode===AUDIBLE_TARGETED_MODE?normalizedTargetFields(payload):[];
 if(mode===AUDIBLE_TARGETED_MODE&&!targetFields.length)throw new Error('Targeted enrichment response is missing target_fields.');
 const seen=new Set();
 const records=payload.audiobooks.map((raw,index)=>{
  if(hasOwn(raw,'media_type')&&String(raw?.media_type||'').toLowerCase()!=='audiobook')throw new Error(`Record ${index+1} is not marked as an audiobook.`);
  const asin=normalizeAsin(raw?.audible_asin||raw?.asin);
  if(!/^[A-Z0-9]{10}$/.test(asin))throw new Error(`Record ${index+1} has an invalid Audible ASIN.`);
  if(seen.has(asin))throw new Error(`Duplicate ASIN ${asin} appears more than once in this batch.`);seen.add(asin);
  const presentFields=Object.keys(raw||{});
  if(mode===AUDIBLE_TARGETED_MODE){
   for(const key of presentFields){
    if(key==='source_evidence'||IDENTITY_FIELDS.has(key)||targetFields.includes(key))continue;
    throw new Error(`Targeted record ${index+1} (${asin}) supplied unrelated field ${key}. Nothing imported.`);
   }
  }
  const title=clean(raw?.title||raw?.display_title);
  if(mode!==AUDIBLE_TARGETED_MODE&&!title)throw new Error(`Record ${index+1} (${asin}) is missing title.`);
  const cover=hasOwn(raw,'cover_image_url')?clean(raw.cover_image_url):null;if(cover&&!isHttps(cover))throw new Error(`Record ${index+1} (${asin}) has a non-HTTPS cover_image_url.`);
  const product=hasOwn(raw,'audible_product_url')?clean(raw.audible_product_url):null;if(product&&!isHttps(product))throw new Error(`Record ${index+1} (${asin}) has an invalid audible_product_url.`);
  const runtime=hasOwn(raw,'runtime_minutes')?(raw.runtime_minutes==null||raw.runtime_minutes===''?null:Number(raw.runtime_minutes)):null;if(runtime!=null&&(!Number.isFinite(runtime)||runtime<=0||runtime>200000))throw new Error(`Record ${index+1} (${asin}) has an invalid runtime_minutes.`);
  const remaining=hasOwn(raw,'remaining_minutes')?(raw.remaining_minutes==null||raw.remaining_minutes===''?null:Number(raw.remaining_minutes)):null;if(remaining!=null&&(!Number.isFinite(remaining)||remaining<0))throw new Error(`Record ${index+1} (${asin}) has an invalid remaining_minutes.`);
  const listening=hasOwn(raw,'listening_status')?normalizeStatus(raw.listening_status):'unknown';if(hasOwn(raw,'listening_status')&&!allowedListening.has(listening))throw new Error(`Record ${index+1} (${asin}) has unsupported listening_status ${raw.listening_status}.`);
  const ownership=hasOwn(raw,'ownership_status')?normalizeStatus(raw.ownership_status||'owned'):'unknown';if(hasOwn(raw,'ownership_status')&&!allowedOwnership.has(ownership))throw new Error(`Record ${index+1} (${asin}) has unsupported ownership_status ${raw.ownership_status}.`);
  const series=hasOwn(raw,'series')||hasOwn(raw,'primary_series')?normalizedSeries(raw.series||raw.primary_series):null;
  if(series&&series.position!=null&&!Number.isFinite(series.position))throw new Error(`Record ${index+1} (${asin}) has an invalid series position.`);
  return {media_type:'audiobook',fizz_record_id:clean(raw.fizz_record_id||raw.audiobook_id),audible_asin:asin,title,display_title:clean(raw.display_title),raw_title:clean(raw.raw_title),audible_product_url:product,authors:hasOwn(raw,'authors')?stringList(raw.authors):[],narrators:hasOwn(raw,'narrators')?stringList(raw.narrators):[],series,runtime_minutes:runtime==null?null:Math.round(runtime),runtime_display:clean(raw.runtime_display),description:clean(raw.description),description_is_truncated:raw.description_is_truncated?1:0,cover_image_url:cover,ownership_status:ownership,listening_status:listening,audible_progress_text:clean(raw.audible_progress_text),remaining_minutes:remaining==null?null:Math.round(remaining),can_listen_now:raw.can_listen_now===false?0:1,source_evidence:clean(raw.source_evidence),present_fields:presentFields};
 });
 const responseAsins=mode==='add_new'?null:(Array.isArray(payload.requested_asins)?payload.requested_asins:expectedAsins);
 if(responseAsins){
  const expected=[...responseAsins].map(normalizeAsin),actual=records.map(record=>record.audible_asin);
  if(expected.length!==actual.length)throw new Error(`Incomplete ASIN reconciliation: expected ${expected.length} records but received ${actual.length}. Nothing imported.`);
  for(let i=0;i<expected.length;i++)if(actual[i]!==expected[i])throw new Error(`ASIN/order mismatch at record ${i+1}: expected ${expected[i]} but received ${actual[i]}. Nothing imported.`);
 }
 return {...payload,mode,target_fields:targetFields,audiobooks:records,expected_record_count:requiredCount??payload.audiobooks.length};
}

export function validateAudibleImportAgainstLibrary(validated,books=[]){
 const byAsin=new Map(),byId=new Map();
 for(const book of books){const asin=normalizeAsin(book.audible_asin);if(asin)byAsin.set(asin,book);if(book.audiobook_id)byId.set(String(book.audiobook_id),book)}
 const mode=validated.mode,targetFields=validated.target_fields||[];
 const records=validated.audiobooks.map((record,index)=>{
  const byRecordId=record.fizz_record_id?byId.get(String(record.fizz_record_id))||null:null;
  const byRecordAsin=byAsin.get(record.audible_asin)||null;
  if(byRecordId&&normalizeAsin(byRecordId.audible_asin)!==record.audible_asin)throw new Error(`Identity conflict at record ${index+1}: Fizz record ID ${record.fizz_record_id} belongs to ${normalizeAsin(byRecordId.audible_asin)}, not ${record.audible_asin}. Nothing imported.`);
  if(byRecordId&&byRecordAsin&&String(byRecordId.audiobook_id)!==String(byRecordAsin.audiobook_id))throw new Error(`Identity conflict at record ${index+1}: Fizz record ID and Audible ASIN resolve to different audiobooks. Nothing imported.`);
  const existing=byRecordId||byRecordAsin||null;
  if(mode!=='add_new'&&!existing)throw new Error(`Enrichment record ${index+1} (${record.audible_asin}) does not match an existing Audible audiobook. Nothing imported.`);
  if(mode===AUDIBLE_TARGETED_MODE){
   const mutable=record.present_fields.filter(field=>TARGETABLE_FIELDS.has(field)&&!IDENTITY_FIELDS.has(field));
   for(const field of mutable)if(!targetFields.includes(field))throw new Error(`Targeted record ${index+1} (${record.audible_asin}) attempted to modify ${field}, which was not requested. Nothing imported.`);
  }
  return {...record,resolved_audiobook_id:existing?.audiobook_id||null,resolved_title:existing?.title||record.title||record.audible_asin,will_create:!existing&&mode==='add_new'};
 });
 return {...validated,audiobooks:records};
}

export function audibleExistingRecord(book={}){
 const split=value=>String(value||'').split(' · ').map(item=>item.trim()).filter(Boolean);
 return {media_type:'audiobook',fizz_record_id:clean(book.audiobook_id),audible_asin:normalizeAsin(book.audible_asin),title:book.title||null,display_title:book.display_title||null,audible_product_url:book.audible_product_url||null,authors:split(book.authors),narrators:split(book.narrators),series:book.series_name?{name:book.series_name,audible_series_id:book.audible_series_id||null,audible_url:book.audible_url||null,position:book.series_position??null}:null,runtime_minutes:Number(book.runtime_minutes)||null,runtime_display:book.runtime_display||null,description:book.description||null,cover_image_url:/^https:\/\//i.test(String(book.cover_image_url||''))?book.cover_image_url:null,ownership_status:book.ownership_status||'unknown',listening_status:book.listening_status||'unknown',audible_progress_text:book.audible_progress_text||null,remaining_minutes:book.remaining_minutes??null};
}
export function summarizeAudibleImport(records=[],existingAsins=new Set(),{mode=null,targetFields=[]}={}){
 let newCount=0,existingCount=0,covers=0,runtimes=0,unchangedTargets=0;
 for(const record of records){if(record.will_create||!existingAsins.has(record.audible_asin))newCount++;else existingCount++;if(record.cover_image_url)covers++;if(record.runtime_minutes)runtimes++;if(mode===AUDIBLE_TARGETED_MODE&&targetFields.includes(AUDIBLE_COVER_TARGET)&&!record.cover_image_url)unchangedTargets++}
 const summary={received:records.length,newCount,existingCount,covers,runtimes};if(mode===AUDIBLE_TARGETED_MODE)summary.unchangedTargets=unchangedTargets;return summary;
}
