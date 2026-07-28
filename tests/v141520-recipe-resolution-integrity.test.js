import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildRecipeSnapshot} from '../src/nutrition/recipe.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

const baseFood={food_id:'F100',name:'Atlantic Salmon',default_serving:100,unit:'g',calories:208,protein:20,carbs:0,fat:13,saturated_fat:3.1,fiber:0,nutrition_known:0};
const recipe=[{recipe_id:'R100',recipe_name:'Salmon Power Salad',ingredient_id:'F100',ingredient_name:'Atlantic Salmon',amount:140,unit:'g'}];

test('stored recipe quantity remains available when food nutrition is incomplete',()=>{
 const snap=buildRecipeSnapshot(recipe,[baseFood]);
 assert.equal(snap.ingredients[0].amount,140);
 assert.equal(snap.ingredients[0].resolved_amount,140);
 assert.equal(snap.ingredients[0].resolved_unit,'g');
 assert.equal(snap.ingredients[0].resolved,true);
});

test('available nutrients from partially enriched food contribute to recipe totals',()=>{
 const snap=buildRecipeSnapshot(recipe,[baseFood]);
 assert.equal(Math.round(snap.nutrition.calories),291);
 assert.equal(Math.round(snap.nutrition.protein),28);
 assert.equal(snap.nutrition_known,0,'recipe remains flagged incomplete until all required nutrition is known');
 assert.ok(snap.issues.some(issue=>issue.includes('available nutrients were included')));
});

test('recipe detail falls back to stored quantity fields',()=>{
 assert.ok(main.includes('quantityLabel(r.resolved_amount??r.amount,r.resolved_unit||r.unit)'));
 assert.ok(main.includes('quantityLabel(ingredient.resolved_amount??ingredient.amount,ingredient.resolved_unit||ingredient.unit)'));
});

test('migration only promotes sufficiently complete food records',()=>{
 assert.ok(database.includes("version:74,name:'recipe_ingredient_resolution_integrity'"));
 for(const field of ['calories','protein','carbs','fiber','fat','saturated_fat','trans_fat','cholesterol','sodium','total_sugar','added_sugar']){
  assert.ok(database.includes(`${field} IS NOT NULL`),`migration must require ${field}`);
 }
});
