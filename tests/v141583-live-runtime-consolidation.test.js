import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildAvailabilityIndex} from '../src/inventory/availability.js';
import {clearInventoryRuntimeAudit,getInventoryRuntimeAudit,consumeInventory} from '../src/inventory/service.js';

const blueberry={pantry_id:'P-BLUE',food_id:'F-BLUE',item:'Blueberries',food_name:'Blueberries',quantity:1,package_count:1,unit:'containers',servings_per_package:1,partial_package_quantity:null,default_serving:100,food_unit:'g'};
const onion={pantry_id:'P-ONION',food_id:'F-ONION',item:'Red Onion',food_name:'Red Onion',quantity:1,package_count:1,unit:'containers',servings_per_package:1,partial_package_quantity:null,default_serving:150,food_unit:'g'};

test('production availability path emits required ingredient diagnostics',()=>{
 clearInventoryRuntimeAudit();
 const index=buildAvailabilityIndex({pantryRows:[blueberry,onion],recipeRows:[
  {recipe_id:'R-FRUIT',ingredient_type:'food',ingredient_id:'F-BLUE',ingredient_name:'Blueberries',amount:100,unit:'g'},
  {recipe_id:'R-SALAD',ingredient_type:'food',ingredient_id:'F-ONION',ingredient_name:'Red Onion',amount:1,unit:'onion'}
 ]});
 assert.equal(index.foodAvailableServings('F-BLUE','Blueberries'),1);
 assert.equal(index.recipeAvailable('R-FRUIT','Fruit Bowl'),true);
 assert.equal(index.recipeAvailable('R-SALAD','Daily Salad'),true);
 const rows=getInventoryRuntimeAudit();
 assert.ok(rows.some(row=>row.food_id==='F-BLUE'&&row.inventory_record_id==='P-BLUE'&&row.computed_available_servings===1));
 assert.ok(rows.some(row=>row.food_id==='F-ONION'&&row.serving_size===150&&row.servings_per_container===1));
 assert.ok(rows.every(row=>'decision' in row&&'caller' in row));
});

test('batch deduction uses the same production inventory service',()=>{
 const result=consumeInventory(onion,1,'onion',{caller:'Batch preparation',recipeId:'R-SALAD'});
 assert.equal(result.ok,true);
 assert.equal(result.usedServings,1);
 assert.equal(result.updates.quantity,0);
});

test('Library and Menu no longer calculate availability independently',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(main,/foodServingsAvailable=item=>availability\.foodAvailableServings/);
 assert.match(main,/const menuFoodAvailability=meal=>.*availability\.foodAvailableServings/);
 assert.doesNotMatch(main,/const foodServingsAvailable=item=>.*inventoryAvailableQuantity/);
 assert.doesNotMatch(main,/const menuFoodAvailability=meal=>.*inventoryAvailableQuantity/);
});
