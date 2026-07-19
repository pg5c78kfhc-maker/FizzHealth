import test from 'node:test';
import assert from 'node:assert/strict';
import {createDecisionMemoryRecord,decisionFingerprint,findDecisionMemory,upsertDecisionMemory,summarizeDecisionChange,rememberDecision,readDecisionMemory,clearDecisionMemory} from '../src/decision/memory.js';
import {ENGINE_VERSION,RULES_VERSION} from '../src/decision/engine.js';

const trace=(overrides={})=>({type:'simulation',subject:'meal-a',subjectId:'meal-a',score:72,status:'improves',action:'Choose the meal.',inputs:{added_nutrition:{calories:400,protein:30}},comparison:null,engineVersion:ENGINE_VERSION,rulesVersion:RULES_VERSION,...overrides});
const storage=()=>{let value=null;return {getItem:()=>value,setItem:(_,next)=>{value=next},removeItem:()=>{value=null}}};

test('fingerprint is stable for equivalent input key order',()=>{assert.equal(decisionFingerprint(trace({inputs:{b:2,a:1}})),decisionFingerprint(trace({inputs:{a:1,b:2}})))});
test('exact memory match reuses prior reasoning',()=>{const record=createDecisionMemoryRecord(trace(),{recordedAt:'2026-07-17T12:00:00.000Z'});const match=findDecisionMemory([record],trace(),{now:Date.parse('2026-07-18T12:00:00.000Z')});assert.equal(match.match,'exact');assert.equal(match.stale,false);assert.match(match.summary,/evaluated before/)});
test('related context reports material changes',()=>{const record=createDecisionMemoryRecord(trace(),{recordedAt:'2026-07-17T12:00:00.000Z'});const current=trace({score:65,status:'tradeoff',action:'Reduce saturated fat.',inputs:{added_nutrition:{calories:700}}});const match=findDecisionMemory([record],current,{now:Date.parse('2026-07-18T12:00:00.000Z')});assert.equal(match.match,'context');assert.match(match.summary,/fell by 7/);assert.match(match.summary,/recommended action changed/)});
test('stale memory is identified and not silently reused',()=>{const record=createDecisionMemoryRecord(trace(),{recordedAt:'2026-07-01T12:00:00.000Z'});const match=findDecisionMemory([record],trace(),{now:Date.parse('2026-07-17T12:00:00.000Z')});assert.equal(match.stale,true);assert.match(match.summary,/stale/)});
test('upsert deduplicates exact decisions and preserves newest first',()=>{const first=createDecisionMemoryRecord(trace(),{recordedAt:'2026-07-17T10:00:00.000Z'});const updated=upsertDecisionMemory([first],trace(),{recordedAt:'2026-07-17T11:00:00.000Z'});assert.equal(updated.length,1);assert.equal(updated[0].recordedAt,'2026-07-17T11:00:00.000Z')});
test('storage round trip and clear remain local',()=>{const store=storage();const remembered=rememberDecision(trace(),{storage:store,now:'2026-07-17T12:00:00.000Z'});assert.equal(remembered.records.length,1);assert.equal(readDecisionMemory(store).length,1);clearDecisionMemory(store);assert.equal(readDecisionMemory(store).length,0)});
test('unchanged related decision says materially unchanged',()=>{const previous={trace:trace()};assert.match(summarizeDecisionChange(previous,trace()),/materially unchanged/)});
