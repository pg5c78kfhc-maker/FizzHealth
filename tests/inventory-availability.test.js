import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAvailabilityIndex} from '../src/inventory/availability.js';

test('tracked zero food is unavailable while untracked food remains available',()=>{
 const availability=buildAvailabilityIndex({pantryRows:[{food_id:'F1',item:'Milk',quantity:0,unit:'g',discontinued:0}]});
 assert.equal(availability.foodAvailable('F1','Milk'),false);
 assert.equal(availability.foodAvailable('F2','Untracked'),true);
});

test('positive quantity across pantry records keeps food available',()=>{
 const availability=buildAvailabilityIndex({pantryRows:[{food_id:'F1',quantity:0,unit:'g'},{food_id:'F1',quantity:2,unit:'g'}]});
 assert.equal(availability.foodAvailable('F1'),true);
});

test('tracked recipe is planner eligible only when prepared inventory exists',()=>{
 const recipeRows=[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F1',ingredient_name:'Milk',amount:100,unit:'g'}];
 const mealDefinitions=[{meal_id:'recipe:R1',source_type:'legacy_recipe',source_id:'R1',track_inventory:1}];
 const withoutPrepared=buildAvailabilityIndex({pantryRows:[{food_id:'F1',quantity:500,unit:'g'}],recipeRows,mealDefinitions});
 assert.equal(withoutPrepared.recipeAvailable('R1','Smoothie'),false);
 assert.equal(withoutPrepared.recipeCanPrepare('R1'),true);
 const withPrepared=buildAvailabilityIndex({pantryRows:[{food_id:'F1',quantity:0,unit:'g'},{food_id:'recipe:R1',quantity:200,unit:'g'}],recipeRows,mealDefinitions});
 assert.equal(withPrepared.recipeAvailable('R1','Smoothie'),true);
});

test('recipe cannot be prepared when a tracked ingredient is insufficient',()=>{
 const availability=buildAvailabilityIndex({pantryRows:[{food_id:'F1',quantity:50,unit:'g'}],recipeRows:[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F1',ingredient_name:'Milk',amount:100,unit:'g'}]});
 assert.equal(availability.recipeCanPrepare('R1'),false);
});

test('composite meal is unavailable when a required component is zero but ignores optional components',()=>{
 const pantryRows=[{food_id:'F1',quantity:0,unit:'g'},{food_id:'F2',quantity:0,unit:'g'}];
 const mealComponents=[{meal_id:'M1',component_type:'food',component_id:'F1',optional:0},{meal_id:'M2',component_type:'food',component_id:'F2',optional:1}];
 const availability=buildAvailabilityIndex({pantryRows,mealComponents});
 assert.equal(availability.mealAvailable('M1'),false);
 assert.equal(availability.mealAvailable('M2'),true);
});
