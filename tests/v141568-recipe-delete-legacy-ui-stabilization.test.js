import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('unified Library has exclusive right and left swipe rails',()=>{
 assert.match(main,/discovery-swipe-right-rail/);
 assert.match(main,/discovery-swipe-left-rail/);
 assert.match(main,/const direction=offset>0\?'right':offset<0\?'left':'closed'/);
 assert.match(css,/mutually exclusive unified Library swipe rails/);
});

test('Add is right swipe and management actions are left swipe',()=>{
 const right=main.indexOf('discovery-swipe-right-rail');
 const left=main.indexOf('discovery-swipe-left-rail');
 assert.ok(right>0&&left>right);
 assert.ok(main.indexOf('className="swipe-quick"',right)<left);
 assert.ok(main.indexOf('className="swipe-archive"',left)>left);
 assert.ok(main.indexOf('className="swipe-delete"',left)>left);
});

test('Foods and Recipes both expose guarded permanent deletion',()=>{
 assert.match(main,/onDelete=\{\(\)=>permanentlyDeleteFood\(x\)\}/);
 assert.match(main,/onDelete=\{\(\)=>permanentlyDeleteRecipe\(x\)\}/);
 assert.match(main,/cannot be permanently deleted yet/);
 assert.match(main,/Historical Food Log snapshots will remain/);
});

test('individual Foods and Recipes remain in unified Library and modern records',()=>{
 assert.match(main,/entry\.type==='recipe'/);
 assert.match(main,/entry\.type==='meal'/);
 assert.match(main,/setRecipeDetail\(\{type:'food',\.\.\.x\}\)/);
 assert.match(main,/<FoodRecordDetails key=\{`food-record-/);
 assert.match(main,/<ModernRecipeDetails key=\{`recipe-record-/);
});

test('unused standalone legacy nutrition route is removed',()=>{
 assert.doesNotMatch(main,/nutritionFood&&<NutritionEditor/);
 assert.doesNotMatch(main,/setNutritionFood/);
 assert.doesNotMatch(main,/The Recipe migration did not create a canonical reusable record/);
});
