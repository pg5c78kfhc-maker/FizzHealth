import {ENGINE_VERSION,RULES_VERSION} from './engine.js';

const DEFAULT_KEY='fizz-health-decision-memory-v1';
const DEFAULT_MAX=100;
const DEFAULT_STALE_MS=7*24*60*60*1000;
const stable=value=>{
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
 return value;
};
const hash=value=>{
 const text=JSON.stringify(stable(value));let result=2166136261;
 for(let i=0;i<text.length;i++){result^=text.charCodeAt(i);result=Math.imul(result,16777619)}
 return (result>>>0).toString(36);
};
const clone=value=>JSON.parse(JSON.stringify(value));
const memoryInputs=trace=>({type:trace?.type,subjectId:trace?.subjectId,inputs:trace?.inputs,comparison:trace?.comparison?.ranking||null});

export function decisionFingerprint(trace){return `${trace?.type||'decision'}:${trace?.subjectId||trace?.subject||'unknown'}:${hash(memoryInputs(trace))}`;}
export function decisionContextFingerprint(trace){return `${trace?.type||'decision'}:${trace?.subjectId||trace?.subject||'unknown'}`;}
export function summarizeDecisionChange(previous,current){
 if(!previous)return null;
 const scoreDelta=Number(current?.score||0)-Number(previous?.trace?.score||0);
 const statusChanged=String(previous?.trace?.status||'')!==String(current?.status||'');
 const actionChanged=String(previous?.trace?.action||'')!==String(current?.action||'');
 const parts=[];
 if(scoreDelta)parts.push(`score ${scoreDelta>0?'rose':'fell'} by ${Math.abs(scoreDelta)} point${Math.abs(scoreDelta)===1?'':'s'}`);
 if(statusChanged)parts.push(`status changed from ${previous.trace.status} to ${current.status}`);
 if(actionChanged)parts.push('the recommended action changed');
 return parts.length?`Since the previous decision, ${parts.join(', ')}.`:'The result is materially unchanged from the previous decision.';
}
export function findDecisionMemory(records,trace,{now=Date.now(),staleMs=DEFAULT_STALE_MS}={}){
 const list=Array.isArray(records)?records:[];
 const fingerprint=decisionFingerprint(trace),context=decisionContextFingerprint(trace);
 const exact=list.find(item=>item.fingerprint===fingerprint)||null;
 const previous=list.find(item=>item.contextFingerprint===context)||null;
 const chosen=exact||previous;
 if(!chosen)return Object.freeze({match:'none',record:null,stale:false,summary:'No earlier matching decision was found.'});
 const stale=now-new Date(chosen.recordedAt).getTime()>staleMs||chosen.engineVersion!==ENGINE_VERSION||chosen.rulesVersion!==RULES_VERSION;
 const match=exact?'exact':'context';
 const summary=stale?'A related prior decision exists, but it is stale and was not reused.':exact?'This same decision has been evaluated before. The prior reasoning is still applicable.':summarizeDecisionChange(chosen,trace);
 return Object.freeze({match,record:chosen,stale,summary});
}
export function createDecisionMemoryRecord(trace,{recordedAt=new Date().toISOString(),source='decision'}={}){
 return Object.freeze({id:`decision-${Date.parse(recordedAt)||Date.now()}-${Math.random().toString(36).slice(2,8)}`,fingerprint:decisionFingerprint(trace),contextFingerprint:decisionContextFingerprint(trace),recordedAt,source,engineVersion:trace?.engineVersion||ENGINE_VERSION,rulesVersion:trace?.rulesVersion||RULES_VERSION,trace:clone(trace)});
}
export function upsertDecisionMemory(records,trace,options={}){
 const next=createDecisionMemoryRecord(trace,options),list=(Array.isArray(records)?records:[]).filter(item=>item.fingerprint!==next.fingerprint);
 return Object.freeze([next,...list].slice(0,options.maxRecords||DEFAULT_MAX));
}
export function readDecisionMemory(storage=globalThis?.localStorage,key=DEFAULT_KEY){
 try{const parsed=JSON.parse(storage?.getItem(key)||'[]');return Array.isArray(parsed)?parsed:[]}catch{return []}
}
export function writeDecisionMemory(records,storage=globalThis?.localStorage,key=DEFAULT_KEY){storage?.setItem(key,JSON.stringify(records));return records;}
export function rememberDecision(trace,{storage=globalThis?.localStorage,key=DEFAULT_KEY,source='decision',now=new Date().toISOString()}={}){
 const records=readDecisionMemory(storage,key),match=findDecisionMemory(records,trace,{now:Date.parse(now)}),updated=upsertDecisionMemory(records,trace,{recordedAt:now,source});writeDecisionMemory(updated,storage,key);return Object.freeze({match,record:updated[0],records:updated});
}
export function clearDecisionMemory(storage=globalThis?.localStorage,key=DEFAULT_KEY){storage?.removeItem(key);return []}
