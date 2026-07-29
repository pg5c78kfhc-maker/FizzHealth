import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Pantry completeness includes retailer and new package fields',()=>{
 for(const field of ['Bought at','Manufacturer','Package size','Servings per package','Amount left in the open package']) assert.match(main,new RegExp(field));
 assert.match(main,/function pantryCompleteness/);
});
test('Pantry quantity entered by user is not overwritten by package calculation',()=>{
 assert.match(main,/enteredQuantity!==null\?enteredQuantity:calculatedQuantity/);
});
test('Pantry cards prioritize product information and mark out of stock',()=>{
 assert.match(main,/out-of-stock-card/);assert.match(css,/pantry-card-meta/);assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
});
test('Promote to Meal remains available for foods and recipes with duplicate protection',()=>{
 assert.match(main,/Promote to Meal/);assert.match(main,/promotedMeal\?/);assert.match(main,/sourceType=\{isRecipe\?'recipe':'food'\}/);
});
test('Full Nutrition Record package fields use aligned responsive grid',()=>{
 assert.match(main,/nutrition-product-package/);assert.match(css,/nutrition-product-package/);
});
