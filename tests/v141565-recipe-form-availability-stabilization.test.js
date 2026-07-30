import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildAvailabilityIndex} from '../src/inventory/availability.js';

test('untracked Recipe is available from sufficient tracked ingredients without a prepared batch',()=>{
 const index=buildAvailabilityIndex({
  pantryRows:[{food_id:'F1',item:'Creamer',quantity:200,unit:'ml',discontinued:0}],
  recipeRows:[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F1',ingredient_name:'Creamer',amount:40,unit:'ml'}],
  mealDefinitions:[{meal_id:'recipe:R1',source_type:'legacy_recipe',source_id:'R1',track_inventory:0}]
 });
 assert.equal(index.recipeAvailable('R1','Coffee Including Sugar Free Creamer'),true);
});

test('tracked Recipe requires prepared inventory even when ingredients are sufficient',()=>{
 const common={
  pantryRows:[{food_id:'F1',item:'Creamer',quantity:200,unit:'ml',discontinued:0}],
  recipeRows:[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F1',ingredient_name:'Creamer',amount:40,unit:'ml'}],
  mealDefinitions:[{meal_id:'recipe:R1',source_type:'legacy_recipe',source_id:'R1',track_inventory:1}]
 };
 assert.equal(buildAvailabilityIndex(common).recipeAvailable('R1'),false);
 assert.equal(buildAvailabilityIndex({...common,pantryRows:[...common.pantryRows,{food_id:'recipe:R1',item:'Coffee Including Sugar Free Creamer',quantity:96,unit:'g',discontinued:0}]}).recipeAvailable('R1'),true);
});

test('edit rows, checkbox styling, and Recipe batch scrolling use stable shared implementations',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
 assert.match(main,/function FoodRecordPropertyRow/);
 assert.doesNotMatch(main,/const Row=\(\{label,children/);
 assert.match(css,/\.toggle-row input\[type=checkbox\][\s\S]*appearance:none/);
 assert.match(css,/\.recipe-pantry-batch \.editor-scroll[\s\S]*touch-action:pan-y/);
});
