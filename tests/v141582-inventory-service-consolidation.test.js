import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inventoryAvailableQuantity,inventoryAvailableServings,consumeInventory,inventorySufficient} from '../src/inventory/service.js';
import {buildAvailabilityIndex} from '../src/inventory/availability.js';

const blueberry={food_id:'F-BLUE',item:'Blueberries',food_name:'Blueberries',quantity:1,package_count:1,package_type:'',unit:'containers',servings_per_package:1,partial_package_quantity:null,default_serving:100,food_unit:'g',serving_description:'1 serving'};
const onion={food_id:'F-ONION',item:'Red Onion',food_name:'Red Onion',quantity:1,package_count:1,package_type:'container',unit:'containers',servings_per_package:1,partial_package_quantity:null,default_serving:150,food_unit:'g',serving_description:'1 onion'};

test('legacy rows with package_count use the container model even without package_type',()=>{
 assert.equal(inventoryAvailableServings(blueberry),1);
 assert.equal(inventoryAvailableQuantity(blueberry,'g'),100);
 assert.equal(inventorySufficient([blueberry],100,'g'),true);
});

test('Fruit Bowl actual availability path sees one blueberry serving',()=>{
 const index=buildAvailabilityIndex({pantryRows:[blueberry],recipeRows:[{recipe_id:'R-FRUIT',ingredient_type:'food',ingredient_id:'F-BLUE',ingredient_name:'Blueberries',amount:100,unit:'g'}],mealDefinitions:[{meal_id:'recipe:R-FRUIT',source_type:'legacy_recipe',source_id:'R-FRUIT',track_inventory:0}]});
 assert.equal(index.recipeCanPrepare('R-FRUIT'),true);
 assert.equal(index.recipeAvailable('R-FRUIT','Fruit Bowl'),true);
});

test('Daily Salad actual availability path resolves and deducts one onion',()=>{
 const index=buildAvailabilityIndex({pantryRows:[onion],recipeRows:[{recipe_id:'R-SALAD',ingredient_type:'food',ingredient_id:'F-ONION',ingredient_name:'Red Onion',amount:1,unit:'onion'}],mealDefinitions:[{meal_id:'recipe:R-SALAD',source_type:'legacy_recipe',source_id:'R-SALAD',track_inventory:0}]});
 assert.equal(index.recipeCanPrepare('R-SALAD'),true);
 const consumed=consumeInventory(onion,1,'onion');
 assert.equal(consumed.ok,true);
 assert.equal(consumed.updates.package_count,0);
 assert.equal(consumed.updates.status,'Out of Stock');
});

test('all active display, availability and recipe deduction paths import the single service',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 const availability=fs.readFileSync(new URL('../src/inventory/availability.js',import.meta.url),'utf8');
 const compatibility=fs.readFileSync(new URL('../src/inventory/quantity.js',import.meta.url),'utf8');
 assert.match(main,/from '\.\/inventory\/service'/);
 assert.match(availability,/from '\.\/service\.js'/);
 assert.match(compatibility,/Inventory math lives only in inventory\/service\.js/);
 assert.doesNotMatch(main,/from '\.\/inventory\/quantity'/);
});
