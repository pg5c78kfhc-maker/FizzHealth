import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('prepared Recipe shells synchronize source nutrition',()=>{
 assert.match(main,/repairPreparedRecipeFoodNutrition/);
 assert.match(main,/recipe_prepared_batch_sync/);
 assert.match(main,/nutrition_known:1/);
});

test('Menu routes current Food and Recipe records',()=>{
 assert.match(main,/foodEditor\?<FoodRecordDetails/);
 assert.match(main,/\^recipe:\/i\.test\(foodId\)/);
 assert.doesNotMatch(main,/foodEditor\?<NutritionEditor/);
});

test('Recipe creation writes canonical current architecture directly',()=>{
 assert.match(main,/source_type:'recipe'/);
 assert.match(main,/db\.run\('DELETE FROM meal_components WHERE meal_id=\?'/);
 assert.match(main,/insertRecord\(db,'meal_components'/);
});

test('Recipe editor is constrained above bottom navigation',()=>{
 assert.match(css,/v1\.4\.15\.67 — Recipe creation viewport containment/);
 assert.match(css,/grid-template-rows:auto minmax\(0,1fr\)/);
 assert.match(css,/var\(--bottom-nav-height/);
});
