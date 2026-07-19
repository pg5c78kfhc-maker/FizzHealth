import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateNutrient, rankNutrients, scoreChefCandidate, rankChefRecommendations} from '../src/decision/engine.js';

test('late-day protein deficit becomes more urgent than morning deficit', () => {
  const definition={key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:90};
  const morning=evaluateNutrient({definition,value:40,target:180,hour:9});
  const evening=evaluateNutrient({definition,value:40,target:180,hour:20});
  assert.ok(evening.priorityScore > morning.priorityScore);
  assert.equal(evening.status,'urgent');
  assert.ok(evening.negative.some(x=>x.includes('Limited time')));
});

test('limit nutrient jumps in priority when maximum is exceeded', () => {
  const decision=evaluateNutrient({definition:{key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',priority:95},value:25,target:15,max:20,hour:12});
  assert.equal(decision.status,'exceeded');
  assert.ok(decision.score >= 100);
});

test('rankNutrients returns structured decision objects', () => {
  const ranked=rankNutrients({definitions:[
    {key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:90},
    {key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:88}
  ],totals:{protein:20,fiber:29},plannedTotals:{protein:0,fiber:0},targets:{protein:{target:180},fiber:{target:30}},hour:20});
  assert.equal(ranked[0].definition.key,'protein');
  assert.ok(ranked[0].decision.confidence > 0);
  assert.ok(Array.isArray(ranked[0].decision.missing));
});

test('chef recommendation rewards open, expiring, high-protein foods', () => {
  const urgent=scoreChefCandidate({candidate:{pantry_id:'1',item:'Chicken',opened:'Yes',expiration:new Date(Date.now()+86400000).toISOString(),calories:300,protein:35,fiber:5,fat:8,saturated_fat:2,priority:'High'},remaining:{calories:900,protein:100,fiber:20}});
  const weak=scoreChefCandidate({candidate:{pantry_id:'2',item:'Snack',opened:'No',calories:700,protein:4,fiber:0,fat:25,saturated_fat:10},remaining:{calories:500,protein:100,fiber:20}});
  assert.ok(urgent.score > weak.score);
  assert.ok(urgent.positive.includes('Uses an open package'));
});

test('chef ranking observes result limit', () => {
  const candidates=Array.from({length:6},(_,i)=>({pantry_id:String(i),item:`Food ${i}`,calories:100+i,protein:20,fiber:5,fat:2,saturated_fat:1}));
  const ranked=rankChefRecommendations({candidates,remaining:{calories:1000,protein:100,fiber:20},limit:4});
  assert.equal(ranked.length,4);
  assert.ok(ranked.every(x=>x.decision.type==='chef_recommendation'));
});

test('decision trace includes full-disclosure contract and versions', () => {
  const decision=evaluateNutrient({definition:{key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:98},value:10,planned:5,target:35,hour:18});
  assert.equal(decision.subjectId,'fiber');
  assert.equal(decision.subjectName,'Fiber');
  assert.ok(decision.methodology);
  assert.ok(Array.isArray(decision.dataUsed));
  assert.ok(decision.projectedResult);
  assert.ok(decision.engineVersion);
  assert.ok(decision.rulesVersion);
});

test('open package alone cannot overpower a materially healthier option', () => {
  const context={remaining:{calories:1000,protein:120,fiber:25},daily:{saturated_fat:10},targets:{saturated_fat:{target:15}}};
  const openedProcessed=scoreChefCandidate({candidate:{pantry_id:'a',item:'Opened sandwich',opened:'Yes',quantity:4,calories:300,protein:18,fiber:1,fat:15,saturated_fat:8},...context,hour:12});
  const healthier=scoreChefCandidate({candidate:{pantry_id:'b',item:'Salmon salad',opened:'No',quantity:4,calories:380,protein:38,fiber:8,fat:12,saturated_fat:2},...context,hour:12});
  assert.ok(healthier.score > openedProcessed.score);
});

test('ranked chef decisions include rank and comparison', () => {
  const ranked=rankChefRecommendations({candidates:[
    {pantry_id:'1',item:'A',calories:250,protein:30,fiber:6,fat:5,saturated_fat:1},
    {pantry_id:'2',item:'B',calories:260,protein:20,fiber:2,fat:5,saturated_fat:2}
  ],remaining:{calories:1000,protein:100,fiber:20}});
  assert.equal(ranked[0].decision.rank,1);
  assert.ok(ranked[0].decision.comparison?.summary);
});

import {evaluateDecision,evaluateLDLSupport,evaluateSteps,evaluateMaintenance,scoreRestaurantCandidate,simulateDecisionScenario,ENGINE_VERSION,RULES_VERSION} from '../src/decision/engine.js';

test('all central decision evaluators return the standard trace contract',()=>{
 const cases=[
  evaluateDecision('ldl',{totals:{fiber:25,saturated_fat:9,calories:1500},targets:{fiber:{target:40},saturated_fat:{max:15},calories:{target:1700}},coverage:100,activity:{steps:8000,stepTarget:10000,stepsKnown:true}}),
  evaluateDecision('steps',{steps:7000,goal:10000,hour:17,typicalByHour:6500,typicalRemaining:3500}),
  evaluateDecision('maintenance',{estimate:2350,lower:2200,upper:2500,confidence:78,days:18,averageCalories:2050,weightChange:-1.2,stepsAverage:7600}),
  evaluateDecision('restaurant',{meal:{id:1,meal_name:'Grilled fish',calories:500,protein:40,fiber:6,saturated_fat:2,confidence:.9,recommendation_tier:'best_choice',serving_description:'1 plate',preparation:'grilled'},remaining:{calories:900,protein:80,fiber:20},daily:{saturated_fat:5},targets:{saturated_fat:{max:15}}})
 ];
 for(const trace of cases){
  assert.equal(trace.engineVersion,ENGINE_VERSION);assert.equal(trace.rulesVersion,RULES_VERSION);
  assert.ok(trace.type);assert.ok(trace.subjectId);assert.ok(trace.subjectName);assert.ok(Number.isFinite(trace.score));assert.ok(Number.isFinite(trace.confidence));assert.ok(Array.isArray(trace.factors));assert.ok(Array.isArray(trace.dataUsed));assert.ok(trace.evaluatedAt);
 }
});

test('LDL decision uses activity and non-fiber nutrition pressures',()=>{
 const supportive=evaluateLDLSupport({totals:{fiber:35,saturated_fat:6,calories:1600,sodium:1800,added_sugar:10,alcohol:0},targets:{fiber:{target:35},saturated_fat:{max:15},calories:{target:1700},sodium:{max:2300},added_sugar:{max:36}},coverage:100,activity:{steps:10000,stepTarget:10000,stepsKnown:true}});
 const poor=evaluateLDLSupport({totals:{fiber:10,saturated_fat:24,calories:2300,sodium:3500,added_sugar:60,alcohol:2},targets:{fiber:{target:35},saturated_fat:{max:15},calories:{target:1700},sodium:{max:2300},added_sugar:{max:36}},coverage:100,activity:{steps:1000,stepTarget:10000,stepsKnown:true}});
 assert.ok(supportive.score>poor.score);assert.ok(poor.negative.some(x=>x.includes('Alcohol')||x.includes('alcohol')));
});

test('step likelihood improves when personal pace and planned activity support the goal',()=>{
 const base=evaluateSteps({steps:5000,goal:10000,hour:18});
 const supported=evaluateSteps({steps:5000,goal:10000,hour:18,typicalByHour:5000,typicalRemaining:3500,plannedExerciseSteps:2000});
 assert.ok(supported.score>base.score);assert.ok(supported.confidence>base.confidence);
});

test('what-if simulation never changes actual data and reports before-after decisions',()=>{
 const totals={calories:900,protein:80,fiber:12,saturated_fat:8};
 const result=simulateDecisionScenario({scenario:{id:'meal-1',label:'Fiber meal',nutritionDelta:{calories:300,protein:25,fiber:15,saturated_fat:1},additionalSteps:2000,hour:18},totals,plannedTotals:{},targets:{calories:{target:1700},protein:{target:180},fiber:{target:40},saturated_fat:{max:15}},definitions:[{key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:10},{key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:20},{key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',priority:30}],steps:{current:5000,goal:10000,known:true},coverage:100});
 assert.equal(result.actualDataChanged,false);assert.equal(totals.calories,900);assert.equal(result.after.ldl.score>=result.before.ldl.score,true);assert.equal(result.after.steps.score>=result.before.steps.score,true);assert.equal(result.trace.type,'simulation');
});

test('dispatcher owns ranking, pantry matching, and maintenance estimation paths',()=>{
 const pantryRank=evaluateDecision('pantry_match',{pantry:{food_id:'ABC',item:'365 Honey Roast Chicken'},foods:[
  {food_id:'XYZ',name:'Peanut Butter',nutrition_known:1,calories:190},
  {food_id:'ABC',name:'Honey Roast Chicken',nutrition_known:1,protein:25}
 ]});
 assert.equal(pantryRank[0].food.food_id,'ABC');
 const maintenance=evaluateDecision('maintenance_estimate',{weights:[
  {local_date:'2026-07-01',value_primary:230},{local_date:'2026-07-05',value_primary:229.5},{local_date:'2026-07-10',value_primary:229},{local_date:'2026-07-15',value_primary:228.5},{local_date:'2026-07-20',value_primary:228}
 ],mealDays:Array.from({length:20},(_,i)=>({local_date:`2026-07-${String(i+1).padStart(2,'0')}`,calories:2000})),stepDays:Array.from({length:20},(_,i)=>({local_date:`2026-07-${String(i+1).padStart(2,'0')}`,steps:8000}))});
 assert.ok(maintenance.estimate>2000);
 assert.ok(maintenance.confidence>0);
 const ranked=evaluateDecision('nutrients',{definitions:[{key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:10}],totals:{fiber:10},targets:{fiber:{target:35}},hour:18});
 assert.equal(ranked[0].decision.type,'nutrient_priority');
});

test('enhanced meal simulation reports all supported nutrient impacts and suggestions',()=>{
 const result=simulateDecisionScenario({scenario:{id:'meal-2',mode:'meal',label:'Restaurant meal',nutritionDelta:{calories:900,protein:35,carbs:80,fat:40,fiber:3,saturated_fat:18,sodium:2600,added_sugar:22,alcohol:2}},totals:{calories:1100,protein:90,carbs:70,fat:35,fiber:18,saturated_fat:7,sodium:900,added_sugar:8,alcohol:0},plannedTotals:{},targets:{calories:{target:1700,max:2100},protein:{target:180},fiber:{target:40},saturated_fat:{max:15},sodium:{max:2300},added_sugar:{max:36}},definitions:[{key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:10},{key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:20},{key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',priority:30}],steps:{current:5000,goal:10000,known:true},coverage:100});
 assert.equal(result.actualDataChanged,false);
 assert.equal(result.nutrientImpacts.some(x=>x.key==='sodium'&&x.status==='exceeded'),true);
 assert.equal(result.nutrientImpacts.some(x=>x.key==='saturated_fat'&&x.status==='exceeded'),true);
 assert.ok(result.suggestions.length>0);
 assert.equal(result.trace.inputs.scenario_mode,'meal');
});

test('substitution subtracts removed nutrition before adding replacement',()=>{
 const result=simulateDecisionScenario({scenario:{id:'swap-1',mode:'substitution',label:'Swap meal',removeNutrition:{calories:700,protein:20,fiber:2,saturated_fat:12,sodium:1400},nutritionDelta:{calories:450,protein:42,fiber:9,saturated_fat:2,sodium:650}},totals:{calories:1500,protein:100,fiber:20,saturated_fat:16,sodium:2400},plannedTotals:{},targets:{calories:{target:1700,max:2100},protein:{target:180},fiber:{target:40},saturated_fat:{max:15},sodium:{max:2300}},definitions:[{key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:10},{key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:20},{key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',priority:30}],steps:{current:5000,goal:10000,known:true},coverage:100});
 assert.equal(result.delta.calories,-250);
 assert.equal(result.delta.protein,22);
 assert.equal(result.delta.saturated_fat,-10);
 assert.equal(result.scenario.removeNutrition.saturated_fat,12);
 assert.ok(result.after.ldl.score>result.before.ldl.score);
});

test('meal comparison ranks options and explains the winner',()=>{
 const definitions=[
  {key:'protein',label:'Protein',unit:'g',behavior:'goal',priority:80},
  {key:'fiber',label:'Fiber',unit:'g',behavior:'goal',priority:90},
  {key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',priority:100}
 ];
 const payload={totals:{calories:600,protein:40,fiber:10,saturated_fat:4},plannedTotals:{},targets:{protein:{target:180},fiber:{target:45},saturated_fat:{target:15,max:20},calories:{target:1700,max:2100}},definitions,steps:{current:3000,goal:8000,known:true},coverage:100,scenarios:[
  {id:'salmon',label:'Salmon bowl',nutritionDelta:{calories:500,protein:45,fiber:9,saturated_fat:3}},
  {id:'burger',label:'Burger and fries',nutritionDelta:{calories:900,protein:35,fiber:3,saturated_fat:14}}
 ]};
 const result=evaluateDecision('comparison',payload);
 assert.equal(result.ranked.length,2);
 assert.equal(result.winner.scenario.id,'salmon');
 assert.equal(result.trace.type,'meal_comparison');
 assert.equal(result.trace.rank,1);
 assert.match(result.trace.comparison.summary,/Salmon bowl ranks first/);
 assert.equal(result.trace.comparison.ranking[0].id,'salmon');
});

test('meal comparison requires at least two options',()=>{
 assert.throws(()=>evaluateDecision('comparison',{scenarios:[{id:'one',label:'One'}]}),/At least two scenarios/);
});

test('chef recommendation prioritizes thawed food over otherwise equivalent frozen food',()=>{
 const base={calories:350,protein:40,fiber:5,fat:8,saturated_fat:1,quantity:2};
 const payload={remaining:{calories:900,protein:90,fiber:20},daily:{saturated_fat:4},targets:{saturated_fat:{max:15}},now:Date.parse('2026-07-17T12:00:00Z')};
 const thawed=evaluateDecision('chef',{...payload,candidate:{...base,pantry_id:'t',item:'Thawed chicken',status:'thawed',location:'refrigerator'}});
 const frozen=evaluateDecision('chef',{...payload,candidate:{...base,pantry_id:'f',item:'Frozen chicken',status:'frozen',location:'freezer'}});
 assert.ok(thawed.score>frozen.score);
 assert.ok(thawed.positive.includes('Thawed and ready to use'));
});

test('chef recommendation strongly penalizes food past its recorded expiration date',()=>{
 const decision=evaluateDecision('chef',{candidate:{pantry_id:'x',item:'Expired fish',calories:300,protein:40,fiber:0,fat:8,saturated_fat:1,quantity:1,expiration:'2026-07-10'},remaining:{calories:900,protein:90,fiber:20},daily:{saturated_fat:4},targets:{saturated_fat:{max:15}},now:Date.parse('2026-07-17T12:00:00Z')});
 assert.ok(decision.negative.includes('Past the recorded expiration date'));
 assert.ok(decision.factors.some(f=>f.category==='safety'&&f.impact<0));
});
