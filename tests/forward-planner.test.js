import test from 'node:test';
import assert from 'node:assert/strict';
import {buildForwardMealPlan,evaluateDecision} from '../src/decision/engine.js';

const base=[
 {pantry_id:'a',item:'Salmon',on_hand:'Yes',quantity:3,available_servings:3,calories:350,protein:40,fiber:5,fat:12,saturated_fat:2,expiration:'2026-07-20'},
 {pantry_id:'b',item:'Chicken',on_hand:'Yes',quantity:4,available_servings:4,calories:320,protein:45,fiber:3,fat:8,saturated_fat:1,expiration:'2026-07-24'},
 {pantry_id:'c',item:'Greek yogurt',on_hand:'Yes',quantity:2,available_servings:2,calories:180,protein:25,fiber:2,fat:0,saturated_fat:0}
];

test('forward planner never schedules more verified servings than are on hand',()=>{
 const result=buildForwardMealPlan({candidates:base,days:15,startDate:'2026-07-17T12:00:00',now:Date.parse('2026-07-17T12:00:00Z')});
 assert.equal(result.plan.length,9);
 const counts=Object.groupBy(result.plan,x=>x.candidate.pantry_id);
 assert.equal(counts.a.length,3);assert.equal(counts.b.length,4);assert.equal(counts.c.length,2);
 assert.equal(result.summary.coveragePercent,60);
});

test('forward planner distributes foods instead of repeating the same item on adjacent days when alternatives exist',()=>{
 const result=evaluateDecision('forward_plan',{candidates:base,days:5,startDate:'2026-07-17T12:00:00',now:Date.parse('2026-07-17T12:00:00Z')});
 for(let i=1;i<result.plan.length;i++)assert.notEqual(result.plan[i].candidate.pantry_id,result.plan[i-1].candidate.pantry_id);
});

test('expired foods are excluded from forward plans',()=>{
 const result=buildForwardMealPlan({candidates:[...base,{pantry_id:'x',item:'Expired fish',on_hand:'Yes',quantity:5,calories:300,protein:40,expiration:'2026-07-10'}],days:20,startDate:'2026-07-17T12:00:00',now:Date.parse('2026-07-17T12:00:00Z')});
 assert.ok(result.plan.every(x=>x.candidate.pantry_id!=='x'));
});
