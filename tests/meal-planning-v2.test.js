import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMealPlan,adaptMealPlan,buildSmartShoppingList,forecastMealPlan,optimizeMealPlan} from '../src/planning/intelligence.js';
const foods=[
 {pantry_id:'salmon',item:'Salmon',quantity:4,calories:350,protein:40,fiber:4,saturated_fat:2,category:'fish',batch_servings:2},
 {pantry_id:'chicken',item:'Chicken salad',quantity:5,calories:320,protein:45,fiber:6,saturated_fat:1,category:'chicken'},
 {pantry_id:'yogurt',item:'Greek yogurt',quantity:3,calories:180,protein:25,fiber:2,saturated_fat:0,category:'dairy'}
];
const targets={calories:{target:1700},protein:{target:180},fiber:{target:35},saturated_fat:{max:15}};
test('generates supported planning horizons and respects inventory',()=>{for(const days of [1,3,7,14,30]){const r=generateMealPlan({candidates:foods,days,targets,mealsPerDay:1,startDate:'2026-07-18'});assert.equal(r.summary.days,days);assert.ok(r.plan.length<=12)}});
test('restaurant events are locked first-class planning events',()=>{const r=generateMealPlan({candidates:foods,restaurantEvents:[{date:'2026-07-19',food_name:'Dinner out',source_type:'restaurant',meal_type:'Dinner'}],days:3,targets,mealsPerDay:2,startDate:'2026-07-18'});const dinner=r.plan.find(x=>x.food_name==='Dinner out');assert.equal(dinner.lock_state,'locked');assert.equal(dinner.source_type,'restaurant')});
test('batch items create leftover meals',()=>{const r=generateMealPlan({candidates:[foods[0]],days:3,targets,mealsPerDay:1,startDate:'2026-07-18'});assert.ok(r.plan.some(x=>x.source_type==='leftover'))});
test('smart shopping aggregates plan demand',()=>{const list=buildSmartShoppingList({plan:[{food_id:'a',food_name:'A'},{food_id:'a',food_name:'A'},{food_id:'a',food_name:'A'}],pantry:[{food_id:'a',quantity:1}]});assert.equal(list[0].buy,2)});
test('adaptation preserves locked and unaffected meals',()=>{const plan=[{date:'2026-07-18',food_name:'Locked',lock_state:'locked'},{date:'2026-07-19',food_name:'Old',lock_state:'flexible'}];const r=adaptMealPlan({plan,events:[{date:'2026-07-19',type:'meal_skipped'}],candidates:foods,context:{targets,mealsPerDay:1}});assert.ok(r.plan.some(x=>x.food_name==='Locked'));assert.ok(r.changed>0)});
test('forecast and optimization expose health and pantry outcomes',()=>{const r=optimizeMealPlan({candidates:foods,days:3,targets,mealsPerDay:1,currentWeight:227,startDate:'2026-07-18'});assert.ok(Number.isFinite(r.optimization.score));assert.ok(['Improving','Stable','Worsening'].includes(r.forecast.ldlDirection));assert.ok(r.forecast.pantryUtilization>0)});
