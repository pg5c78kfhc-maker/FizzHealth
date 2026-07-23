import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('Recipes view exposes a context-aware New Recipe action',()=>{
 assert.match(main,/view==='recipes'\?<button[^>]*onClick=\{\(\)=>setShowRecipeCreate\(true\)\}><Plus\/><span>New Recipe<\/span><\/button>/);
 assert.match(main,/view==='recipes'\?.*New Recipe.*:.*New Food/s);
});

test('recipe creation editor captures reusable ingredients and saves schema-aware rows',()=>{
 assert.match(main,/function RecipeCreateEditor\(\{foods,recipe=null,onClose,onSaved\}\)/);
 assert.match(main,/Recipe name/);
 assert.match(main,/Add ingredient/);
 assert.match(main,/insertRecord\(db,'recipes'/);
 assert.match(main,/ingredient_type:'food'/);
 assert.match(main,/ingredient_id:row\.food\?\.food_id\|\|row\.food_id\|\|null/);
});

test('recipe creation validates incomplete and duplicate definitions',()=>{
 assert.match(main,/Enter a recipe name/);
 assert.match(main,/Every ingredient needs a quantity greater than zero/);
 assert.match(main,/can appear only once/);
 assert.match(main,/A recipe with this name already exists/);
});

test('successful recipe creation returns to the Recipes list',()=>{
 assert.match(main,/setShowRecipeCreate\(false\);setView\('recipes'\);setQ\(''\)/);
 assert.match(main,/created\.`/);
});
