import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('Library excludes migrated recipe records from legacy Meal routing',()=>{
  assert.match(source,/mealDefs=optionalQuery\(`SELECT m\.\* FROM meal_definitions m WHERE COALESCE\(m\.archived,0\)=0 AND COALESCE\(m\.source_type,''\)<>'legacy_recipe'/);
  assert.match(source,/if\(entry\.type==='recipe'\)return <SwipeArchiveCard[\s\S]*?onOpen=\{\(\)=>setRecipeDetail\(\{type:'recipe',recipe_id:x\.recipe_id\}\)\}/);
});

test('Planner excludes migrated recipe duplicates and opens modern Recipe detail',()=>{
  assert.match(source,/savedMeals=optionalQuery\(`SELECT \*, 'meal' AS planner_source FROM meal_definitions WHERE COALESCE\(archived,0\)=0 AND COALESCE\(source_type,''\)<>'legacy_recipe'/);
  assert.match(source,/const openInformationItem=meal=>\{if\(String\(meal\?\.planner_source\|\|''\)==='recipe'\)\{setInformationItem\(null\);setRecipeDetail\(\{type:'recipe',recipe_id:meal\.recipe_id\|\|meal\.meal_id\}\)/);
  assert.match(source,/recipeDetail\?<ModernRecipeDetails key=\{`planner-recipe-record-\$\{recipeDetail\.recipe_id\}`\}/);
});

test('Recipe serving-to-gram stabilization remains wired',()=>{
  assert.match(source,/const servingGrams=convertQuantity\(servingSize,servingUnit,'g'\)/);
  assert.match(source,/const weight=recipeComponentBatchWeight\(components,foods\)/);
  assert.match(source,/const servings=weight\.grams\/grams/);
});
