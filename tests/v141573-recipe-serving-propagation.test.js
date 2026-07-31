import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('Recipe planner derives per-serving nutrition from canonical batch totals',()=>{
 assert.match(source,/function recipeServingSnapshot\(runQuery,recipeId\)/);
 assert.match(source,/getMealNutrition\(runQuery,canonical\.meal_id\)/);
 assert.match(source,/finite\(full\.nutrition\[key\]\)\/batch/);
 assert.match(source,/calculatedBatch=weight\.complete&&weight\.grams>0&&servingGrams>0\?weight\.grams\/servingGrams:null/);
});

test('projected, planned, and consumed nutrition share the planner per-serving values',()=>{
 assert.match(source,/scaled=Object\.fromEntries\(NUTRIENT_KEYS\.map\(key=>\[key,finite\(meal\[key\]\)\*portions\]\)\)/);
 assert.match(source,/scaledNutrition=Object\.fromEntries\(NUTRIENT_KEYS\.map\(key=>\[key,meal\[key\]==null\?null:finite\(meal\[key\]\)\*portions\]\)\)/);
 assert.match(source,/\.\.\.scaledNutrition/);
});

test('active broken planned Recipe nutrition is repaired once without rewriting consumed history',()=>{
 assert.match(source,/async function repairBrokenPlannedRecipeNutritionOnce\(\)/);
 assert.match(source,/SELECT \* FROM planned_meals WHERE status='planned'/);
 assert.doesNotMatch(source,/SELECT \* FROM meals WHERE.*recipe_serving_repair_141573/);
 assert.match(source,/planned_recipe_serving_repair_141573/);
});
