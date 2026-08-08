export const AUDIBLE_EXCHANGE_FORMAT='fizz-health-audible-exchange';
export const AUDIBLE_EXCHANGE_SCHEMA_VERSION=1;
export const AUDIBLE_REQUEST_TYPE='audible_library_batch_request';
export const AUDIBLE_RESPONSE_TYPE='audible_library_batch_response';
export const AUDIBLE_OPERATION='upsert_audiobooks';

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
export function normalizeAudibleExchangeJson(text=''){
 const source=String(text).replace(/^\uFEFF/,'').replace(/\u00a0/g,' ').replace(/[“”„‟]/g,'"').replace(/[‘’‚‛]/g,"'").replace(/\r\n?/g,'\n').trim();
 const unfenced=source.replace(/^\s*```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
 const start=unfenced.indexOf('{'),end=unfenced.lastIndexOf('}');
 return start>=0&&end>start?unfenced.slice(start,end+1):unfenced;
}
export function parseAudibleExchangeJson(text=''){
 const normalized=normalizeAudibleExchangeJson(text);
 if(!normalized)throw new Error('Paste the Audible JSON response first.');
 try{return {payload:JSON.parse(normalized),normalized}}
 catch(error){throw new Error(`Audible JSON syntax failed: ${error?.message||error}`)}
}
export function buildAudibleBatchRequest({existingRecords=[],mode='add_new',batchSize=50}={}){
 const requestId=`audible-${mode}-${Date.now()}`;
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
   rules:[
    'Return ONLY one valid JSON object. Do not add markdown, commentary, or code fences.',
    'Preserve format, schema_version, request_id, operation, and set request_type to audible_library_batch_response.',
    'Audiobooks only. Exclude podcast shows, podcast episodes, music, and other non-audiobook audio.',
    'Use Audible ASIN as the authoritative identity and never invent an ASIN.',
    'Populate only information supported by the supplied Audible capture or a confidently matched public catalog record.',
    'Unknown is null. Do not guess missing runtimes, series positions, URLs, or artwork.',
    'For cover_image_url, return only a validated direct HTTPS image URL for the matching audiobook cover; otherwise null.',
    'Prefer Audible/Amazon catalog identity for artwork validation and cross-check title and author when possible.',
    'runtime_minutes is the total audiobook runtime, not time remaining.',
    'Use media_type=audiobook for every record.',
    'Preserve explicit Finished state from the capture. Do not infer finished merely because Listen now or Mark as finished is present.'
   ]
  },
  existing_records:existingRecords,
  audiobook_schema:{media_type:'audiobook',audible_asin:null,title:null,display_title:null,audible_product_url:null,authors:[],narrators:[],series:null,runtime_minutes:null,runtime_display:null,description:null,cover_image_url:null,ownership_status:'owned',listening_status:'unknown',audible_progress_text:null,remaining_minutes:null,can_listen_now:true,source_evidence:null},
  audiobooks:[]
 };
}
export function validateAudibleBatchResponse(payload,{expectedRequestId=null,maxRecords=100}={}){
 if(!payload||payload.format!==AUDIBLE_EXCHANGE_FORMAT)throw new Error('Not a Fizz Health Audible exchange.');
 if(Number(payload.schema_version)!==AUDIBLE_EXCHANGE_SCHEMA_VERSION)throw new Error(`Expected Audible exchange schema v${AUDIBLE_EXCHANGE_SCHEMA_VERSION}.`);
 if(payload.request_type!==AUDIBLE_RESPONSE_TYPE)throw new Error(`Expected request_type ${AUDIBLE_RESPONSE_TYPE}.`);
 if(payload.operation!==AUDIBLE_OPERATION)throw new Error(`Expected operation ${AUDIBLE_OPERATION}.`);
 if(expectedRequestId&&String(payload.request_id)!==String(expectedRequestId))throw new Error('The response belongs to a different Audible exchange request.');
 if(!Array.isArray(payload.audiobooks))throw new Error('The exchange is missing the audiobooks array.');
 if(payload.audiobooks.length===0)throw new Error('The Audible exchange contains no audiobook records.');
 if(payload.audiobooks.length>maxRecords)throw new Error(`This importer accepts at most ${maxRecords} audiobook records per batch.`);
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
 return {...payload,audiobooks:records};
}
export function audibleExistingRecord(book={}){
 const split=value=>String(value||'').split(' · ').map(item=>item.trim()).filter(Boolean);
 return {media_type:'audiobook',audible_asin:normalizeAsin(book.audible_asin),title:book.title||null,display_title:book.display_title||null,audible_product_url:book.audible_product_url||null,authors:split(book.authors),narrators:split(book.narrators),series:book.series_name?{name:book.series_name,audible_series_id:book.audible_series_id||null,audible_url:book.audible_url||null,position:book.series_position??null}:null,runtime_minutes:Number(book.runtime_minutes)||null,runtime_display:book.runtime_display||null,description:book.description||null,cover_image_url:/^https:\/\//i.test(String(book.cover_image_url||''))?book.cover_image_url:null,ownership_status:book.ownership_status||'unknown',listening_status:book.listening_status||'unknown',audible_progress_text:book.audible_progress_text||null,remaining_minutes:book.remaining_minutes??null};
}
export function summarizeAudibleImport(records=[],existingAsins=new Set()){
 let newCount=0,existingCount=0,covers=0,runtimes=0;for(const record of records){if(existingAsins.has(record.audible_asin))existingCount++;else newCount++;if(record.cover_image_url)covers++;if(record.runtime_minutes)runtimes++}return {received:records.length,newCount,existingCount,covers,runtimes};
}
