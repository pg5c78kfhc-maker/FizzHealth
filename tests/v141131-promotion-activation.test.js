import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('shared promotion editor renders above decision detail pages',()=>{
 const decision=css.match(/\.decision-page\{[^}]*z-index:(\d+)/);
 const promotion=css.match(/\.promotion-backdrop\{[^}]*z-index:(\d+)/);
 assert.ok(decision,'decision page z-index must be explicit');
 assert.ok(promotion,'promotion backdrop z-index must be explicit');
 assert.ok(Number(promotion[1])>Number(decision[1]),'promotion editor must render above Food and Recipe details');
});

test('Food and Recipe details use the same promotion editor',()=>{
 assert.match(main,/promoting&&<PromoteToMealEditor sourceType=\{isRecipe\?'recipe':'food'\} source=\{source\}/);
 assert.match(main,/onClick=\{\(\)=>setPromoting\(true\)\}[^>]*><UtensilsCrossed\/> Promote to Meal/);
});

test('promotion editor has no autofocus and defaults category to Any',()=>{
 const start=main.indexOf('function PromoteToMealEditor');
 const end=main.indexOf('function FoodRecipeDetails',start);
 const block=main.slice(start,end);
 assert.match(block,/useState\('Any'\)/);
 assert.doesNotMatch(block,/autoFocus/);
 assert.match(block,/insertRecord\(db,'meal_definitions'/);
 assert.match(block,/insertRecord\(db,'meal_components'/);
 assert.doesNotMatch(block,/INSERT INTO meals|planned_meals|UPDATE pantry/);
});
