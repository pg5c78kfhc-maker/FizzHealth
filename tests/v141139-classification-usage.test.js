import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');
const version=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.11.39 remains recorded in release history',()=>{
 assert.match(main,/version:'1\.4\.11\.39',name:'Food Classification & Planning Intelligence'/);
});

test('migration adds classification and usage with conservative defaults',()=>{
 assert.match(db,/food_classification_and_usage_model/);
 assert.match(db,/foods ADD COLUMN classification TEXT DEFAULT 'ingredient'/);
 assert.match(db,/foods ADD COLUMN usage_designation TEXT DEFAULT 'component'/);
 assert.match(db,/recipes ADD COLUMN usage_designation TEXT DEFAULT 'standalone'/);
 assert.match(db,/meal_definitions ADD COLUMN usage_designation TEXT DEFAULT 'standalone'/);
});

test('all object editors expose classification and usage',()=>{
 assert.match(main,/function RecipeCreateEditor[\s\S]*classification-controls/);
 assert.match(main,/function MealDefinitionEditor[\s\S]*classification-controls/);
 assert.match(main,/Classification & Usage/);
 assert.match(main,/function DataEnrichmentPage/);
});

test('planner includes standalone and both foods and recipes',()=>{
 assert.match(main,/standaloneFoods[\s\S]*IN \('standalone','both'\)/);
 assert.match(main,/standaloneRecipes[\s\S]*IN \('standalone','both'\)/);
 assert.match(main,/const meals=\[\.\.\.savedMeals,\.\.\.standaloneFoods,\.\.\.standaloneRecipes\]/);
});

test('builders select component-capable records',()=>{
 assert.match(main,/usage_designation,consumption_role,'component'\) IN \('component','both'\)/);
 assert.match(main,/usage_designation,'standalone'\) IN \('component','both'\)/);
});
