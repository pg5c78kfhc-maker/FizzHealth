import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDecisionTrace,
  validateDecisionTrace,
  DECISION_TRACE_CONTRACT,
  evaluateDecision
} from '../src/decision/engine.js';

const definitions=[
  {key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:90},
  {key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:88},
  {key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',priority:95}
];
const targets={protein:{target:180},fiber:{target:35},saturated_fat:{max:15},calories:{target:1700}};

function assertCanonical(trace){
  const result=validateDecisionTrace(trace,{throwOnError:false});
  assert.deepEqual(result,{valid:true,errors:[]});
  for(const field of DECISION_TRACE_CONTRACT.required) assert.ok(field in trace,`missing ${field}`);
  assert.equal(Object.isFrozen(trace),true);
}

test('factory normalizes and validates the canonical DecisionTrace contract',()=>{
  const trace=createDecisionTrace({type:'test',subject:'subject-1',subjectName:'Test subject',score:61.4,confidence:87.6,factors:[{label:'Evidence',impact:'4',category:'test'}]});
  assertCanonical(trace);
  assert.equal(trace.score,61);
  assert.equal(trace.confidence,88);
  assert.deepEqual(trace.factors,[{label:'Evidence',impact:4,category:'test'}]);
});

test('validator reports malformed traces and factory rejects missing identity',()=>{
  const malformed={};
  const result=validateDecisionTrace(malformed,{throwOnError:false});
  assert.equal(result.valid,false);
  assert.ok(result.errors.some(error=>error.includes('type')));
  assert.throws(()=>createDecisionTrace({type:'bad',subject:null,subjectName:'',score:1,confidence:1}),/subjectId is required/);
});

test('all decision evaluators produce canonical traces',()=>{
  const traces=[
    evaluateDecision('nutrient',{definition:definitions[0],value:60,target:180,hour:18}),
    ...evaluateDecision('nutrients',{definitions,totals:{protein:60,fiber:12,saturated_fat:7},targets,hour:18}).map(row=>row.decision),
    evaluateDecision('chef',{candidate:{pantry_id:'p1',item:'Salmon',calories:350,protein:40,fiber:4,fat:12,saturated_fat:2,quantity:2},remaining:{calories:900,protein:100,fiber:20},daily:{saturated_fat:5},targets}),
    ...evaluateDecision('chef_rank',{candidates:[{pantry_id:'p1',item:'Salmon',calories:350,protein:40,fiber:4,fat:12,saturated_fat:2,quantity:2}],remaining:{calories:900,protein:100,fiber:20},daily:{saturated_fat:5},targets}).map(row=>row.decision),
    evaluateDecision('ldl',{totals:{fiber:20,saturated_fat:8,calories:1300},targets,coverage:100,activity:{steps:7000,stepTarget:10000,stepsKnown:true}}),
    evaluateDecision('steps',{steps:7000,goal:10000,hour:17,typicalByHour:6500,typicalRemaining:3000}),
    evaluateDecision('maintenance',{estimate:2300,lower:2150,upper:2450,confidence:80,days:20,averageCalories:2050,weightChange:-1.1,stepsAverage:8000}),
    evaluateDecision('restaurant',{meal:{id:'r1',meal_name:'Grilled fish',calories:500,protein:40,fiber:5,saturated_fat:2,confidence:.9,serving_description:'1 plate',preparation:'grilled'},remaining:{calories:900,protein:90,fiber:20},daily:{saturated_fat:4},targets}),
    ...evaluateDecision('pantry_match',{pantry:{food_id:'F1',item:'Chicken'},foods:[{food_id:'F1',name:'Chicken',nutrition_known:1,protein:30}]}).map(row=>row.decision),
    evaluateDecision('simulation',{scenario:{id:'s1',label:'Walk',additionalSteps:2000,hour:18},totals:{calories:1000,protein:80,fiber:15,saturated_fat:7},targets,definitions,steps:{current:5000,goal:10000,known:true},coverage:100}).trace
  ];
  assert.ok(traces.length>=10);
  traces.forEach(assertCanonical);
});

test('ranked traces retain canonical validation after rank and comparison are applied',()=>{
  const chef=evaluateDecision('chef_rank',{candidates:[
    {pantry_id:'1',item:'A',calories:200,protein:30,fiber:5,saturated_fat:1},
    {pantry_id:'2',item:'B',calories:300,protein:20,fiber:2,saturated_fat:3}
  ],remaining:{calories:900,protein:100,fiber:20},targets});
  chef.forEach(({decision},index)=>{assertCanonical(decision);assert.equal(decision.rank,index+1);assert.ok(decision.comparison?.summary)});
});
