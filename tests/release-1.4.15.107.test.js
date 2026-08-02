import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getRecipeNutrition} from '../src/nutrition/aggregate.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const availability=fs.readFileSync(new URL('../src/inventory/availability.js',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('release metadata is v1.4.15.107',()=>{
 assert.equal(pkg.version,'1.4.15.107');
 assert.match(main,/const VERSION='1\.4\.15\.107'/);
 assert.match(db,/Canonical Recipe Composition/);
});

test('recipe consumption reads canonical meal components, not legacy recipe rows',()=>{
 assert.match(main,/FROM meal_components WHERE meal_id=\? ORDER BY sort_order,id'\,\[basis\.mealId\]/);
 assert.doesNotMatch(main,/SELECT ingredient_id,ingredient_name,amount,unit,ingredient_type FROM recipes WHERE recipe_id=\?/);
});

test('recipe edits rebuild compatibility rows from canonical components',()=>{
 assert.match(main,/function syncRecipeCompatibility\(/);
 assert.match(main,/DELETE FROM recipes WHERE recipe_id=\?/);
 assert.match(main,/syncRecipeCompatibility\(db,recipeId,canonical\.meal_id\)/);
 assert.match(db,/JOIN meal_components mc ON mc\.meal_id=md\.meal_id/);
});

test('availability includes canonical recipe and legacy recipe definitions',()=>{
 assert.match(availability,/\['recipe','legacy_recipe'\]\.includes/);
 assert.match(main,/mc\.component_type ingredient_type/);
});

test('canonical recipe nutrition ignores a stale recipes-table ingredient',()=>{
 const meal={meal_id:'recipe:SMOOTHIE',title:'Protein Smoothie',source_type:'recipe',source_id:'SMOOTHIE'};
 const components=[{id:1,meal_id:meal.meal_id,component_type:'food',component_id:'WF-ALMOND',component_name:'Whole Foods Vanilla Almond Milk',amount:300,unit:'mL',sort_order:0}];
 const foods=[{food_id:'WF-ALMOND',name:'Whole Foods Vanilla Almond Milk',default_serving:240,unit:'mL',nutrition_known:1,calories:30,protein:1,carbs:1,fiber:0,fat:2.5,saturated_fat:0,sodium:150,potassium:160,total_sugar:0,added_sugar:0,cholesterol:0}];
 const query=(sql,params=[])=>{
  if(sql.includes('FROM meal_definitions')&&sql.includes('source_type'))return [meal];
  if(sql.startsWith('SELECT * FROM meal_definitions'))return [meal];
  if(sql.includes('FROM meal_components'))return components;
  if(sql.includes('FROM foods'))return foods;
  if(sql.includes('FROM recipes'))return [{recipe_id:'SMOOTHIE',ingredient_id:'OLD',ingredient_name:'Unsweetened Almond Milk',amount:300,unit:'g'}];
  return [];
 };
 const snapshot=getRecipeNutrition(query,'SMOOTHIE');
 assert.equal(snapshot.recipe_name,'Protein Smoothie');
 assert.equal(snapshot.ingredients[0].component_name,'Whole Foods Vanilla Almond Milk');
 assert.equal(snapshot.ingredients[0].unit,'mL');
 assert.equal(snapshot.nutrition_known,1);
});
