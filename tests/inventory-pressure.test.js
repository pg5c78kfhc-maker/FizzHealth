import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateDecision,buildForwardMealPlan} from '../src/decision/engine.js';

const now=Date.parse('2026-07-17T12:00:00Z');

test('inventory pressure prioritizes thawed opened food expiring soon',()=>{
 const urgent=evaluateDecision('inventory_pressure',{candidate:{pantry_id:'u',item:'Chicken',quantity:2,opened:'Yes',status:'thawed',location:'refrigerator',expiration:'2026-07-19'},now});
 const stable=evaluateDecision('inventory_pressure',{candidate:{pantry_id:'s',item:'Frozen chicken',quantity:2,opened:'No',status:'frozen',location:'freezer',expiration:'2026-08-20'},now});
 assert.ok(urgent.score>stable.score);
 assert.equal(urgent.status,'critical');
 assert.ok(urgent.positive.includes('Thawed and should be used soon'));
});

test('expired inventory is flagged as a safety exception',()=>{
 const result=evaluateDecision('inventory_pressure',{candidate:{pantry_id:'x',item:'Fish',quantity:1,expiration:'2026-07-10'},now});
 assert.equal(result.status,'expired');
 assert.match(result.action,/Do not recommend/);
 assert.ok(result.factors.some(x=>x.category==='safety'));
});

test('serving surplus increases pressure when preferred cadence is too low',()=>{
 const surplus=evaluateDecision('inventory_pressure',{candidate:{pantry_id:'a',item:'Yogurt',quantity:8,preferred_servings_per_week:1,expiration:'2026-08-01'},horizonDays:14,now});
 const balanced=evaluateDecision('inventory_pressure',{candidate:{pantry_id:'b',item:'Yogurt',quantity:2,preferred_servings_per_week:1,expiration:'2026-08-01'},horizonDays:14,now});
 assert.ok(surplus.score>balanced.score);
 assert.ok(surplus.factors.some(x=>x.label.includes('Serving surplus')));
});

test('forward planner exposes inventory pressure and uses it in ordering',()=>{
 const candidates=[
  {pantry_id:'urgent',item:'Urgent fish',on_hand:'Yes',quantity:1,available_servings:1,calories:300,protein:40,fiber:2,fat:5,saturated_fat:1,opened:'Yes',status:'thawed',location:'refrigerator',expiration:'2026-07-18'},
  {pantry_id:'stable',item:'Stable chicken',on_hand:'Yes',quantity:1,available_servings:1,calories:300,protein:40,fiber:2,fat:5,saturated_fat:1,status:'frozen',location:'freezer',expiration:'2026-08-20'}
 ];
 const result=buildForwardMealPlan({candidates,days:2,startDate:'2026-07-17T12:00:00',now});
 assert.equal(result.plan[0].candidate.pantry_id,'urgent');
 assert.equal(result.plan[0].inventoryPressure.type,'inventory_pressure');
});
