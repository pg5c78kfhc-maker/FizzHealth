import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateAvailableServings,pantryConfidence,freshnessStatus,pantryPriority,reconcilePantryItem,forecastPantry,buildPantryIntelligence} from '../src/pantry/intelligence.js';
const now=Date.parse('2026-07-17T12:00:00Z');

test('FH-1070 derives verified availability',()=>{
 assert.equal(calculateAvailableServings({on_hand:'Yes',quantity:600,serving_size:200}),3);
 assert.equal(calculateAvailableServings({on_hand:'No',quantity:600,serving_size:200}),0);
});
test('FH-1071 tracks remaining servings through consumption',()=>{
 const next=reconcilePantryItem({quantity:4,on_hand:'Yes'},{event_type:'meal',quantity:1,event_at:'2026-07-17'});
 assert.equal(next.quantity,3);assert.equal(next.on_hand,'Yes');
});
test('FH-1072 evaluates expiration and thaw freshness',()=>{
 assert.equal(freshnessStatus({expiration:'2026-07-18'},now).status,'urgent');
 assert.equal(freshnessStatus({thaw_date:'2026-07-10',thaw_life_days:3},now).status,'expired');
});
test('FH-1073 prioritizes opened thawed food',()=>{
 const urgent=pantryPriority({pantry_id:'a',quantity:2,on_hand:'Yes',opened:'Yes',status:'thawed',expiration:'2026-07-18'},[],now);
 const stable=pantryPriority({pantry_id:'b',quantity:8,on_hand:'Yes',location:'freezer',expiration:'2026-09-01'},[],now);
 assert.ok(urgent.score>stable.score);assert.equal(urgent.status,'critical');
});
test('FH-1074 confidence rises after verification',()=>{
 const base=pantryConfidence({pantry_id:'a',quantity:2},[],now);
 const verified=pantryConfidence({pantry_id:'a',quantity:2,verified_at:'2026-07-17'},[],now);
 assert.ok(verified>base);
});
test('FH-1075 forecasts inventory runout',()=>{
 const f=forecastPantry({pantry_id:'a',quantity:10,average_daily_servings:2},[{pantry_id:'a',servings:2}],[],new Date(now));
 assert.equal(f.remainingAfterPlan,8);assert.equal(f.daysRemaining,4);assert.equal(f.runoutDate,'2026-07-21');
});
test('Epic 5 returns ranked integrated pantry intelligence',()=>{
 const rows=buildPantryIntelligence({items:[{pantry_id:'stable',item:'Frozen chicken',on_hand:'Yes',quantity:5,location:'freezer',expiration:'2026-09-01'},{pantry_id:'urgent',item:'Fish',on_hand:'Yes',quantity:1,opened:'Yes',expiration:'2026-07-18'}],now});
 assert.equal(rows[0].pantry_id,'urgent');assert.ok('confidence' in rows[0]);assert.ok(rows[0].forecast);
});
