import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAvailabilityIndex} from '../src/inventory/availability.js';

test('tracked zero food is unavailable while untracked food remains available',()=>{
 const availability=buildAvailabilityIndex({pantryRows:[{food_id:'F1',item:'Milk',quantity:0,discontinued:0}]});
 assert.equal(availability.foodAvailable('F1','Milk'),false);
 assert.equal(availability.foodAvailable('F2','Untracked'),true);
});

test('positive quantity across pantry records keeps food available',()=>{
 const availability=buildAvailabilityIndex({pantryRows:[{food_id:'F1',quantity:0},{food_id:'F1',quantity:2}]});
 assert.equal(availability.foodAvailable('F1'),true);
});

test('recipe is unavailable when a required tracked ingredient is zero',()=>{
 const availability=buildAvailabilityIndex({pantryRows:[{food_id:'F1',quantity:0}],recipeRows:[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F1',ingredient_name:'Milk'}]});
 assert.equal(availability.recipeAvailable('R1','Smoothie'),false);
});

test('composite meal is unavailable when a required component is zero but ignores optional components',()=>{
 const pantryRows=[{food_id:'F1',quantity:0},{food_id:'F2',quantity:0}];
 const mealComponents=[{meal_id:'M1',component_type:'food',component_id:'F1',optional:0},{meal_id:'M2',component_type:'food',component_id:'F2',optional:1}];
 const availability=buildAvailabilityIndex({pantryRows,mealComponents});
 assert.equal(availability.mealAvailable('M1'),false);
 assert.equal(availability.mealAvailable('M2'),true);
});
