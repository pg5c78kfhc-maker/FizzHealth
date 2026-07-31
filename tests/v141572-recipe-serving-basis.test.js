import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('Recipe planner records divide batch nutrition by servings per batch',()=>{
 assert.match(main,/function recipePlannerRecord\(recipe\)/);
 assert.match(main,/finite\(snapshot\.nutrition\[key\]\)\/basis\.batch/);
 assert.match(main,/\.map\(recipePlannerRecord\)/);
});

test('Recipe serving basis comes from canonical Recipe definition',()=>{
 assert.match(main,/function recipeServingBasis\(runQuery,recipeId\)/);
 assert.match(main,/serving_size,serving_unit,servings_per_batch/);
});

test('Planner and consumed logs persist actual serving quantity and unit',()=>{
 assert.match(main,/loggedAmount=servingAmount\*portions/);
 assert.match(main,/amount:sourceType==='restaurant'\?portions:loggedAmount/);
 assert.match(main,/amount:loggedAmount,unit:servingUnit/);
});

test('Prepared Recipe inventory is consumed before raw ingredients',()=>{
 assert.match(main,/const prepared=db\.query/);
 assert.match(main,/if\(prepared\)return \[\{pantry_id:prepared\.pantry_id/);
 assert.match(main,/amount:multiplier\*basis\.size,unit:basis\.unit/);
});

test('Existing gram-based plan records reopen as portions',()=>{
 assert.match(main,/storedUnit==='serving'\?storedAmount:storedAmount\/basis/);
});
