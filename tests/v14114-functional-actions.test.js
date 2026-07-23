import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('v1.4.11.4 metadata is current everywhere',()=>{
  assert.equal(meta.version,'1.4.11.4');
  assert.equal(meta.build,'141140');
  assert.equal(meta.release_id,'FH-20260723-141140');
  assert.match(main,/const VERSION='1\.4\.11\.4'/);
  assert.match(main,/const BUILD_ID='141140'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260723-141140'/);
});

test('pantry detail pencil closes detail and opens the real editor',()=>{
  assert.match(main,/const target=scoreItem;setScoreItem\(null\);setSelectedPantry\(target\)/);
  assert.match(main,/selectedPantry&&<PantryItemEditor/);
});

test('recipe save executes persistence rather than only rendering a check icon',()=>{
  assert.match(main,/async function save\(\)\{\s*if\(saving\)return;/);
  assert.match(main,/DELETE FROM recipes WHERE recipe_id=\?/);
  assert.match(main,/insertRecord\(db,'recipes'/);
  assert.match(main,/onSaved\?\.\(recipeName,recipeId\)/);
});

test('recipe detail actions open Universal Log in both modes',()=>{
  assert.match(main,/onClick=\{\(\)=>setLogStatus\('planned'\)\}>Plan for later/);
  assert.match(main,/onClick=\{\(\)=>setLogStatus\('consumed'\)\}>Consume now/);
  assert.match(main,/logStatus&&<UniversalLogPanel/);
});
