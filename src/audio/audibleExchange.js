export const AUDIBLE_EXCHANGE_FORMAT='fizz-health-audible-exchange';
export const AUDIBLE_EXCHANGE_SCHEMA_VERSION=1;
export const AUDIBLE_REQUEST_TYPE='audible_library_batch_request';
export const AUDIBLE_RESPONSE_TYPE='audible_library_batch_response';
export const AUDIBLE_OPERATION='upsert_audiobooks';
export const AUDIBLE_ENRICH_BATCH_SIZE=10;
export const AUDIBLE_ADD_NEW_BATCH_SIZE=50;

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
export function normalizeAudibleExchangeJson(text=''){
 // Audible exchange parsing is intentionally strict. Only BOM and harmless outer whitespace are normalized.
 return String(text).replace(/^\uFEFF/,'').trim();
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
 const normalized=normalizeAudibleExchangeJson(text);
 if(!normalized)throw new Error('Paste the Audible JSON response first.');
 try{return {payload:JSON.parse(normalized),normalized}}
 catch(error){throw new Error(audibleJsonSyntaxMessage(normalized,error))}
}
export function buildAudibleBatchRequest({existingRecords=[],mode='add_new',batchSize=mode==='enrich_existing'?AUDIBLE_ENRICH_BATCH_SIZE:AUDIBLE_ADD_NEW_BATCH_SIZE}={}){
 const requestId=`audible-${mode}-${Date.now()}`;
 const expectedRecordCount=mode==='enrich_existing'?existingRecords.length:batchSize;
 const rules=[
  'STRICT OUTPUT FORMAT: Return exactly ONE complete syntactically valid JSON object and nothing else.',
  'The response must be directly parseable by JavaScript JSON.parse() without cleanup, repair, extraction, preprocessing, or conversion.',
  'Do not return Markdown, code fences, commentary, citations, explanations, headings, prefixes, suffixes, or any text outside the JSON object.',
  'Use strict JSON syntax only. All object keys and string delimiters must use the standard ASCII double quotation mark U+0022 (\").',
  'Never use smart or curly quotation marks as JSON delimiters. Smart punctuation may appear only inside a properly encoded JSON string value.',
  'Never use single quotation marks as JSON delimiters, never include trailing commas, and never include comments.',
  'Never emit undefined, NaN, Infinity, or another non-JSON value. Use null when a value is unknown.',
  'Properly JSON-escape every string. Escape embedded double quotes, backslashes, newlines, tabs, and control characters as required by the JSON standard.',
  'Descriptions and other catalog text must be safely JSON-escaped before insertion; quotation marks copied from source text must never terminate the surrounding JSON string.',
  'Do not truncate the response. Every opening object, array, and string delimiter must have its matching closing delimiter.',
  'The first non-whitespace character of the response must be { and the final non-whitespace character must be }.',
  'Before returning the response, internally verify that the COMPLETE response successfully parses with JSON.parse(). If it would not parse, correct it before returning it.',
  'Preserve format, schema_version, request_id, operation, and mode, and set request_type to audible_library_batch_response.',
  mode==='enrich_existing'
   ?`BATCH COMPLETENESS IS REQUIRED: ${expectedRecordCount} existing records were submitted. Return exactly ${expectedRecordCount} audiobook response records — one for every submitted existing record, in the same order.`
   :`BATCH COMPLETENESS IS REQUIRED: this is a ${batchSize}-record new-book batch. Return exactly ${batchSize} audiobook response records when the supplied Audible capture contains the requested full batch.`,
  mode==='enrich_existing'?'Do not omit an audiobook merely because no new metadata could be found. Preserve submitted values and leave unverifiable missing values as null.':`Do not silently omit an audiobook from the supplied batch because enrichment is unavailable; return the record with unverifiable fields set to null.`,
  mode==='enrich_existing'?'Every submitted audible_asin must appear exactly once in the response. Do not add replacement or substitute ASINs.':'Every returned audiobook must have the authoritative Audible ASIN from the supplied capture or a confidently matched Audible catalog record.',
  'Audiobooks only. Exclude podcast shows, podcast episodes, music, and other non-audiobook audio.',
  'Use Audible ASIN as the authoritative identity and never invent an ASIN.',
  'Do not substitute a different edition, narration, abridgment, language, or product because it is easier to find.',
  'Populate only information supported by the supplied Audible capture or a confidently matched public catalog record.',
  'Preserve valid existing non-null metadata unless a confidently matched authoritative catalog record demonstrates that the existing value is incorrect.',
  'Unknown is null. Do not guess missing runtimes, series positions, URLs, artwork, authors, narrators, or other metadata.',
  'Actively attempt to locate a cover_image_url for every audiobook whose current cover_image_url is null.',
  'For cover_image_url, return only a validated direct HTTPS image URL for the exact matching audiobook cover; otherwise null.',
  'Prefer Audible/Amazon catalog identity for artwork validation and cross-check ASIN, title, author, and narrator when possible.',
  'runtime_minutes is the total audiobook runtime, not time remaining. When runtime is verified, populate runtime_minutes and runtime_display consistently.',
  'Use media_type=audiobook for every record.',
  'Preserve ownership_status, listening_status, audible_progress_text, and remaining_minutes from submitted existing records unless the request itself contains newer authoritative listening-state evidence.',
  'Preserve explicit Finished state from the capture. Do not infer finished merely because Listen now or Mark as finished is present.',
  mode==='enrich_existing'?`Before returning, verify audiobooks.length is exactly ${expectedRecordCount}, every submitted audible_asin occurs exactly once, there are no duplicate ASINs, and the input order is preserved.`:`Before returning, verify the audiobook count matches the requested batch, there are no duplicate ASINs, and the supplied capture order is preserved.`,
  'Before returning, perform one final strict JSON syntax validation of the entire payload.'
 ];
 return {
  format:AUDIBLE_EXCHANGE_FORMAT,
  schema_version:AUDIBLE_EXCHANGE_SCHEMA_VERSION,
  request_type:AUDIBLE_REQUEST_TYPE,
  request_id:requestId,
  operation:AUDIBLE_OPERATION,
  mode,
  batch_size:batchSize,
  instructions:{
   recipient:'ChatGPT with access to the pasted Audible library capture and the public Internet',
   purpose:mode==='enrich_existing'?'Enrich these existing Fizz Health Audible audiobook records without creating duplicates.':'Create a batch of Audible audiobook records for import into Fizz Health.',
   rules
  },
  response_requirements:{strict_json:true,json_parse_compatible:true,no_markdown:true,no_code_fences:true,no_commentary:true,return_every_input_record:true,identity_field:'audible_asin',expected_record_count:expectedRecordCount,preserve_input_order:true,require_unique_asins:true},
  existing_records:existingRecords,
  audiobook_schema:{media_type:'audiobook',audible_asin:null,title:null,display_title:null,audible_product_url:null,authors:[],narrators:[],series:null,runtime_minutes:null,runtime_display:null,description:null,cover_image_url:null,ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true,source_evidence:null},
  audiobooks:[]
 };
}
export function validateAudibleBatchResponse(payload,{expectedRequestId=null,maxRecords=100,expectedMode=null,expectedRecordCount=null,expectedAsins=null}={}){
 if(!payload||payload.format!==AUDIBLE_EXCHANGE_FORMAT)throw new Error('Not a Fizz Health Audible exchange.');
 if(Number(payload.schema_version)!==AUDIBLE_EXCHANGE_SCHEMA_VERSION)throw new Error(`Expected Audible exchange schema v${AUDIBLE_EXCHANGE_SCHEMA_VERSION}.`);
 if(payload.request_type!==AUDIBLE_RESPONSE_TYPE)throw new Error(`Expected request_type ${AUDIBLE_RESPONSE_TYPE}.`);
 if(payload.operation!==AUDIBLE_OPERATION)throw new Error(`Expected operation ${AUDIBLE_OPERATION}.`);
 if(expectedMode&&String(payload.mode||'')!==String(expectedMode))throw new Error(`Expected Audible exchange mode ${expectedMode}.`);
 if(expectedRequestId&&String(payload.request_id)!==String(expectedRequestId))throw new Error('The response belongs to a different Audible exchange request.');
 if(!Array.isArray(payload.audiobooks))throw new Error('The exchange is missing the audiobooks array.');
 if(payload.audiobooks.length===0)throw new Error('The Audible exchange contains no audiobook records.');
 if(payload.audiobooks.length>maxRecords)throw new Error(`This importer accepts at most ${maxRecords} audiobook records per batch.`);
 if(expectedRecordCount!=null&&payload.audiobooks.length!==Number(expectedRecordCount))throw new Error(`Incomplete batch: expected ${expectedRecordCount} audiobook records but received ${payload.audiobooks.length}. Nothing imported.`);
 const seen=new Set();
 const records=payload.audiobooks.map((raw,index)=>{
  if(String(raw?.media_type||'').toLowerCase()!=='audiobook')throw new Error(`Record ${index+1} is not marked as an audiobook.`);
  const asin=normalizeAsin(raw.audible_asin||raw.asin);
  if(!/^[A-Z0-9]{10}$/.test(asin))throw new Error(`Record ${index+1} has an invalid Audible ASIN.`);
  if(seen.has(asin))throw new Error(`Duplicate ASIN ${asin} appears more than once in this batch.`);seen.add(asin);
  const title=clean(raw.title||raw.display_title);
  if(!title)throw new Error(`Record ${index+1} (${asin}) is missing title.`);
  const cover=clean(raw.cover_image_url);if(cover&&!isHttps(cover))throw new Error(`Record ${index+1} (${asin}) has a non-HTTPS cover_image_url.`);
  const product=clean(raw.audible_product_url);if(product&&!isHttps(product))throw new Error(`Record ${index+1} (${asin}) has an invalid audible_product_url.`);
  const runtime=raw.runtime_minutes==null||raw.runtime_minutes===''?null:Number(raw.runtime_minutes);if(runtime!=null&&(!Number.isFinite(runtime)||runtime<=0||runtime>200000))throw new Error(`Record ${index+1} (${asin}) has an invalid runtime_minutes.`);
  const remaining=raw.remaining_minutes==null||raw.remaining_minutes===''?null:Number(raw.remaining_minutes);if(remaining!=null&&(!Number.isFinite(remaining)||remaining<0))throw new Error(`Record ${index+1} (${asin}) has an invalid remaining_minutes.`);
  const listening=normalizeStatus(raw.listening_status);if(!allowedListening.has(listening))throw new Error(`Record ${index+1} (${asin}) has unsupported listening_status ${raw.listening_status}.`);
  const ownership=normalizeStatus(raw.ownership_status||'owned');if(!allowedOwnership.has(ownership))throw new Error(`Record ${index+1} (${asin}) has unsupported ownership_status ${raw.ownership_status}.`);
  const series=normalizedSeries(raw.series||raw.primary_series);
  if(series&&series.position!=null&&!Number.isFinite(series.position))throw new Error(`Record ${index+1} (${asin}) has an invalid series position.`);
  return {media_type:'audiobook',audible_asin:asin,title,display_title:clean(raw.display_title),raw_title:clean(raw.raw_title),audible_product_url:product,authors:stringList(raw.authors),narrators:stringList(raw.narrators),series,runtime_minutes:runtime==null?null:Math.round(runtime),runtime_display:clean(raw.runtime_display),description:clean(raw.description),description_is_truncated:raw.description_is_truncated?1:0,cover_image_url:cover,ownership_status:ownership,listening_status:listening,audible_progress_text:clean(raw.audible_progress_text),remaining_minutes:remaining==null?null:Math.round(remaining),can_listen_now:raw.can_listen_now===false?0:1,source_evidence:clean(raw.source_evidence)};
 });
 if(expectedAsins){
  const expected=[...expectedAsins].map(normalizeAsin),actual=records.map(record=>record.audible_asin);
  if(expected.length!==actual.length)throw new Error(`Incomplete ASIN reconciliation: expected ${expected.length} records but received ${actual.length}. Nothing imported.`);
  for(let i=0;i<expected.length;i++)if(actual[i]!==expected[i])throw new Error(`ASIN/order mismatch at record ${i+1}: expected ${expected[i]} but received ${actual[i]}. Nothing imported.`);
 }
 return {...payload,audiobooks:records};
}
export function audibleExistingRecord(book={}){
 const split=value=>String(value||'').split(' · ').map(item=>item.trim()).filter(Boolean);
 return {media_type:'audiobook',audible_asin:normalizeAsin(book.audible_asin),title:book.title||null,display_title:book.display_title||null,audible_product_url:book.audible_product_url||null,authors:split(book.authors),narrators:split(book.narrators),series:book.series_name?{name:book.series_name,audible_series_id:book.audible_series_id||null,audible_url:book.audible_url||null,position:book.series_position??null}:null,runtime_minutes:Number(book.runtime_minutes)||null,runtime_display:book.runtime_display||null,description:book.description||null,cover_image_url:/^https:\/\//i.test(String(book.cover_image_url||''))?book.cover_image_url:null,ownership_status:book.ownership_status||'unknown',listening_status:book.listening_status||'unknown',audible_progress_text:book.audible_progress_text||null,remaining_minutes:book.remaining_minutes??null};
}
export function summarizeAudibleImport(records=[],existingAsins=new Set()){
 let newCount=0,existingCount=0,covers=0,runtimes=0;for(const record of records){if(existingAsins.has(record.audible_asin))existingCount++;else newCount++;if(record.cover_image_url)covers++;if(record.runtime_minutes)runtimes++}return {received:records.length,newCount,existingCount,covers,runtimes};
}
