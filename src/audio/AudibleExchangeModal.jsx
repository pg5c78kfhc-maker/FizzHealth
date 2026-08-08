import React,{useMemo,useState} from 'react';
import {Check,ClipboardCopy,FileJson,Image,ShieldCheck,X} from 'lucide-react';
import {query,transaction} from '../database.js';
import {primeAudibleCoverCache} from './audibleCoverCache.js';
import {AUDIBLE_ADD_NEW_BATCH_SIZE,AUDIBLE_COVER_BATCH_SIZE,AUDIBLE_COVER_TARGET,AUDIBLE_ENRICH_BATCH_SIZE,AUDIBLE_TARGETED_MODE,audibleExistingRecord,audibleTargetIdentity,buildAudibleBatchRequest,parseAudibleUniversalResponse,summarizeAudibleImport,validateAudibleBatchResponse,validateAudibleImportAgainstLibrary} from './audibleExchange.js';
import {upsertAudibleExchangeRecord} from './audibleExchangePersistence.js';

export default function AudibleExchangeModal({books,onClose,onApplied}){
 const incomplete=useMemo(()=>books.filter(book=>!/^https:\/\//i.test(String(book.cover_image_url||''))||!Number(book.runtime_minutes)).slice(0,AUDIBLE_ENRICH_BATCH_SIZE),[books]);
 const missingCovers=useMemo(()=>books.filter(book=>!/^https:\/\//i.test(String(book.cover_image_url||''))).slice(0,AUDIBLE_COVER_BATCH_SIZE),[books]);
 const [requestMode,setRequestMode]=useState('add_new'),[request,setRequest]=useState(''),[response,setResponse]=useState(''),[preview,setPreview]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(null);

 function makeRequest(nextMode=requestMode){
  let existingRecords=[],targetFields=[];
  if(nextMode==='enrich_existing')existingRecords=incomplete.map(audibleExistingRecord);
  if(nextMode===AUDIBLE_TARGETED_MODE){existingRecords=missingCovers.map(audibleTargetIdentity);targetFields=[AUDIBLE_COVER_TARGET]}
  const batchSize=nextMode==='enrich_existing'?AUDIBLE_ENRICH_BATCH_SIZE:nextMode===AUDIBLE_TARGETED_MODE?AUDIBLE_COVER_BATCH_SIZE:AUDIBLE_ADD_NEW_BATCH_SIZE;
  const payload=buildAudibleBatchRequest({existingRecords,mode:nextMode,batchSize,targetFields});
  const text=JSON.stringify(payload,null,2);setRequestMode(nextMode);setRequest(text);setPreview(null);
  if(nextMode===AUDIBLE_TARGETED_MODE)setStatus(`${existingRecords.length} existing audiobook${existingRecords.length===1?'':'s'} missing cover artwork included. The response will contain cover patches only.`);
  else if(nextMode==='enrich_existing')setStatus(`${existingRecords.length} incomplete existing records included for full enrichment.`);
  else setStatus(`Blank ${AUDIBLE_ADD_NEW_BATCH_SIZE}-book Audible capture request created.`);
  return text;
 }
 async function copy(){try{const text=request||makeRequest();await navigator.clipboard.writeText(text);setStatus('Audible exchange request copied.')}catch{setStatus('Clipboard access was blocked. Use the request JSON field and iOS Copy.')}}
 async function paste(){try{const text=await navigator.clipboard.readText();setResponse(text);setPreview(null);setStatus('Clipboard pasted. The importer will identify the transaction from the response itself. Tap Validate & review.')}catch{setStatus('Clipboard access was blocked. Tap inside the field and use iOS Paste.')}}
 async function review(){
  try{
   const parsed=await parseAudibleUniversalResponse(response);
   const validated=validateAudibleBatchResponse(parsed.payload);
   const planned=validateAudibleImportAgainstLibrary(validated,books);
   const existingAsins=new Set(books.map(book=>String(book.audible_asin||'').toUpperCase()));
   const summary=summarizeAudibleImport(planned.audiobooks,existingAsins,{mode:planned.mode,targetFields:planned.target_fields});
   setPreview({...planned,summary,transport:parsed.transport,checksumVerified:parsed.checksumVerified});
   setStatus(`${parsed.transport==='encoded'?'Encoded response decoded and SHA-256 checksum verified.':'Backward-compatible strict JSON response accepted.'} ${planned.audiobooks.length} ${planned.mode===AUDIBLE_TARGETED_MODE?'targeted patch':'audiobook'} record${planned.audiobooks.length===1?'':'s'} validated independently of the currently selected request.`);
  }catch(error){setPreview(null);setStatus(`Validation failed: ${error?.message||error}`)}
 }
 async function apply(){
  if(!preview||busy)return;setBusy(true);setStatus('Importing…');
  try{
   const now=new Date().toISOString(),stats={newCount:0,existingCount:0,coverChanges:0};
   await transaction(async tx=>{
    for(const record of preview.audiobooks){const r=upsertAudibleExchangeRecord(tx,record,now,{mode:preview.mode,targetFields:preview.target_fields||[]});if(r.wasNew)stats.newCount++;else stats.existingCount++;if(r.changedFields?.includes('cover_image_url'))stats.coverChanges++;}
    try{tx.run('INSERT INTO ai_exchange_history(exchange_type,record_key,direction,status,payload,created_at) VALUES (?,?,?,?,?,?)',['audible_library_batch',preview.request_id,'import','approved',JSON.stringify({...preview,audiobooks:preview.audiobooks.map(({present_fields,...record})=>record)}),now])}catch{}
   },{operation:'audible-universal-library-import',transactionId:preview.request_id});
   const refreshed=query(`SELECT b.* FROM audible_audiobooks b WHERE b.audible_asin IN (${preview.audiobooks.map(()=>'?').join(',')})`,preview.audiobooks.map(x=>x.audible_asin));await primeAudibleCoverCache(refreshed);
   const libraryTotal=Number(query('SELECT COUNT(*) count FROM audible_audiobooks WHERE COALESCE(owned_in_audible,0)=1')[0]?.count||0);
   const coverUrls=preview.audiobooks.filter(x=>x.cover_image_url).length,runtimes=preview.audiobooks.filter(x=>x.runtime_minutes).length;
   setResult({received:preview.audiobooks.length,...stats,coverUrls,runtimes,libraryTotal,mode:preview.mode,targetFields:preview.target_fields||[]});setStatus('Import completed successfully.');onApplied?.();
  }catch(error){setStatus(`Import failed. No partial batch was retained: ${error?.message||error}`)}finally{setBusy(false)}
 }

 if(result){const coverOnly=result.mode===AUDIBLE_TARGETED_MODE&&result.targetFields.includes(AUDIBLE_COVER_TARGET);return <div className="modal-backdrop enrichment-modal"><div className="panel fixed-editor enrichment-workspace exchange-success"><div className="edit-head sticky-head"><button className="header-icon-action" onClick={onClose}><X/></button><div><small>AUDIBLE JSON EXCHANGE</small><h3>Import complete</h3></div><span/></div><div className="exchange-success-body"><ShieldCheck/><h2>{result.received} records processed</h2><p>{coverOnly?`${result.coverChanges} cover URL${result.coverChanges===1?'':'s'} added · ${result.received-result.coverChanges} unchanged.`:`${result.newCount} new title${result.newCount===1?'':'s'} added · ${result.existingCount} existing enriched · ${result.coverUrls} cover URL${result.coverUrls===1?'':'s'} supplied · ${result.runtimes} runtime${result.runtimes===1?'':'s'} supplied.`}</p><p><b>Library total: {result.libraryTotal} owned titles</b></p><button className="primary" onClick={onClose}>Done</button></div></div></div>}

 const coverPreview=preview?.mode===AUDIBLE_TARGETED_MODE&&preview.target_fields?.includes(AUDIBLE_COVER_TARGET);
 return <div className="modal-backdrop enrichment-modal" onClick={onClose}><div className="panel fixed-editor enrichment-workspace audible-exchange-workspace" onClick={e=>e.stopPropagation()}><div className="edit-head sticky-head"><button className="header-icon-action" onClick={onClose}><X/></button><div><small>AUDIBLE JSON EXCHANGE</small><h3>Universal library exchange</h3></div><button className="header-icon-action" disabled={!preview||busy} onClick={apply} aria-label="Apply validated Audible import"><Check/></button></div><div className="editor-scroll exchange-workspace-scroll">
  <section className="exchange-step"><small>STEP 1</small><h3>Create a request</h3><div className="audible-exchange-mode"><button className={requestMode==='add_new'?'active':''} onClick={()=>makeRequest('add_new')}><FileJson/> New 50-book batch</button><button className={requestMode==='enrich_existing'?'active':''} onClick={()=>makeRequest('enrich_existing')}><FileJson/> Enrich 10 incomplete</button><button className={requestMode===AUDIBLE_TARGETED_MODE?'active':''} onClick={()=>makeRequest(AUDIBLE_TARGETED_MODE)}><Image/> Covers up to 25</button></div><p>{requestMode==='add_new'?'Use this with the next Audible library capture. New books are deduplicated by ASIN.':requestMode===AUDIBLE_TARGETED_MODE?`Lightweight cover-only request. ${missingCovers.length} of up to ${AUDIBLE_COVER_BATCH_SIZE} missing covers selected.`:`Full enrichment for up to ${AUDIBLE_ENRICH_BATCH_SIZE} incomplete existing books. Current selection: ${incomplete.length}.`}</p><button className="primary" onClick={copy}><ClipboardCopy/> Copy request JSON</button>{request&&<details><summary>View request JSON</summary><textarea className="json-box" value={request} readOnly/></details>}</section>
  <section className="exchange-step"><small>STEP 2</small><h3>Paste any supported Audible response</h3><p>The response is self-contained. It can come from an earlier request or a previous app session.</p><button className="secondary" onClick={paste}><ClipboardCopy/> Paste from clipboard</button><textarea className="json-box response" value={response} onChange={e=>{setResponse(e.target.value);setPreview(null);setStatus('')}} placeholder="Paste an encoded or supported legacy Audible response here…"/><button onClick={review} disabled={!response}>Validate & review</button></section>
  {preview&&<section className="exchange-review"><div className="exchange-review-head"><ShieldCheck/><div><small>VALIDATED {coverPreview?'COVER PATCH':'IMPORT'}</small><h3>{preview.audiobooks.length} audiobook records</h3></div></div><div className="exchange-review-stats audible"><div><b>{preview.summary.newCount}</b><span>new</span></div><div><b>{preview.summary.existingCount}</b><span>existing</span></div><div><b>{preview.summary.covers}</b><span>{coverPreview?'cover patches':'covers'}</span></div><div><b>{coverPreview?preview.summary.unchangedTargets:preview.summary.runtimes}</b><span>{coverPreview?'unchanged':'runtimes'}</span></div></div><p className="exchange-append-note"><ShieldCheck/> {coverPreview?'Only cover artwork can change. Omitted or null cover values leave the existing record untouched.':'The response was validated as a self-contained transaction. Existing ASINs are updated without duplicates; new records are created only by add-new transactions.'}</p><details><summary>Preview audiobook records</summary><ol>{preview.audiobooks.slice(0,50).map(book=><li key={book.audible_asin}><b>{book.resolved_title||book.title||book.audible_asin}</b><span>{book.audible_asin}{book.cover_image_url?' · cover URL':''}{!coverPreview&&book.runtime_minutes?` · ${book.runtime_minutes} min`:''}</span></li>)}</ol></details><button className="primary exchange-apply" disabled={busy} onClick={apply}><Check/> {busy?'Importing…':coverPreview?`Apply ${preview.summary.covers} cover result${preview.summary.covers===1?'':'s'}`:`Import ${preview.audiobooks.length} audiobook${preview.audiobooks.length===1?'':'s'}`}</button></section>}
  {status&&<p className={`capture-message ${preview?'ok':''}`}>{status}</p>}
 </div></div></div>;
}
