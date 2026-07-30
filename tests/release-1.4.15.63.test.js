import test from 'node:test';
import assert from 'node:assert/strict';
import {convertQuantity,foodQuantityToGrams,scaleFoodQuantity} from '../src/nutrition/units.js';
import {buildRecipeSnapshot} from '../src/nutrition/recipe.js';
import {getMealNutrition} from '../src/nutrition/aggregate.js';

const onion={food_id:'F-ONION',name:'Red Onion',default_serving:150,unit:'g',serving_description:'1 medium onion',nutrition_known:1,calories:60,protein:1.5,carbs:14,fiber:2.5,fat:0.2,saturated_fat:0,sodium:6,potassium:220};

test('Food common measure converts one medium Red Onion to 150 g',()=>{
 const result=foodQuantityToGrams({amount:1,amountUnit:'medium',food:onion});
 assert.equal(result.ok,true); assert.equal(result.grams,150); assert.equal(result.method,'common_measure');
});

test('weight-based gram, ounce, and pound ingredients remain directly convertible',()=>{
 assert.equal(convertQuantity(150,'g','g'),150);
 assert.ok(Math.abs(convertQuantity(2,'oz','g')-56.69904625)<1e-8);
 assert.ok(Math.abs(convertQuantity(1,'lb','g')-453.59237)<1e-8);
});

test('imported and manually created Foods use the same serving conversion path',()=>{
 const imported={...onion,food_id:'IMPORTED'};
 const manual={...onion,food_id:'MANUAL',serving_description:'1 medium'};
 assert.equal(scaleFoodQuantity({amount:2,amountUnit:'medium',food:imported}).ratio,2);
 assert.equal(scaleFoodQuantity({amount:.5,amountUnit:'medium',food:manual}).ratio,.5);
});

test('Recipe nutrition resolves count/common-measure ingredients from live Food definitions',()=>{
 const rows=[{recipe_id:'R1',recipe_name:'Onion Recipe',ingredient_id:'F-ONION',ingredient_name:'Red Onion',amount:1,unit:'medium'}];
 const first=buildRecipeSnapshot(rows,[onion]);
 assert.equal(first.issues.length,0); assert.equal(first.nutrition.calories,60);
 const edited={...onion,default_serving:180,calories:72};
 const second=buildRecipeSnapshot(rows,[edited]);
 assert.equal(foodQuantityToGrams({amount:1,amountUnit:'medium',food:edited}).grams,180);
 assert.equal(second.nutrition.calories,72);
});

test('Meal/Recipe dependent calculations re-query edited Food values with no cache',()=>{
 let food={...onion};
 const meal={meal_id:'M1',title:'Onion Recipe'};
 const component={id:1,meal_id:'M1',component_type:'food',component_id:'F-ONION',component_name:'Red Onion',amount:1,unit:'medium',sort_order:0};
 const query=(sql)=>sql.includes('meal_definitions')?[meal]:sql.includes('meal_components')?[component]:sql.includes('FROM foods')?[food]:[];
 assert.equal(getMealNutrition(query,'M1').nutrition.calories,60);
 food={...food,default_serving:180,calories:72};
 assert.equal(getMealNutrition(query,'M1').nutrition.calories,72);
});

test('calculation helpers do not mutate inventory or Food records',()=>{
 const pantry={pantry_id:'P1',quantity:6,unit:'each'};
 const before=structuredClone(pantry),foodBefore=structuredClone(onion);
 foodQuantityToGrams({amount:1,amountUnit:'medium',food:onion});
 assert.deepEqual(pantry,before); assert.deepEqual(onion,foodBefore);
});
