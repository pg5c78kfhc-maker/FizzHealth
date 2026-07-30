import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAvailabilityIndex} from '../src/inventory/availability.js';
import {consumePantryQuantity,pantryAvailableQuantity} from '../src/inventory/quantity.js';

test('packaged ingredient availability includes sealed packages and the open package',()=>{
 const creamer={food_id:'F-CREAMER',item:'Coffee-mate Zero Sugar Hazelnut',quantity:3,unit:'bottles',package_count:3,package_type:'bottle',container_size:946,container_unit:'ml',unopened_packages:2,partial_package_quantity:950,discontinued:0};
 assert.equal(pantryAvailableQuantity(creamer,'ml'),2842);
 const index=buildAvailabilityIndex({
  pantryRows:[creamer],
  recipeRows:[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F-CREAMER',ingredient_name:'Coffee-mate Zero Sugar Hazelnut',amount:40,unit:'ml'}],
  mealDefinitions:[{meal_id:'recipe:R1',source_type:'legacy_recipe',source_id:'R1',track_inventory:0}]
 });
 assert.equal(index.recipeAvailable('R1'),true);
});

test('package inventory becomes insufficient only when normalized contents are below the recipe requirement',()=>{
 const row={food_id:'F1',item:'Creamer',quantity:1,unit:'bottle',package_count:1,package_type:'bottle',container_size:946,container_unit:'ml',unopened_packages:0,partial_package_quantity:30};
 const index=buildAvailabilityIndex({pantryRows:[row],recipeRows:[{recipe_id:'R1',ingredient_type:'food',ingredient_id:'F1',ingredient_name:'Creamer',amount:40,unit:'ml'}],mealDefinitions:[{source_type:'legacy_recipe',source_id:'R1',track_inventory:0}]});
 assert.equal(index.recipeAvailable('R1'),false);
});

test('package consumption deducts from open contents before opening a sealed package',()=>{
 const row={quantity:3,unit:'bottles',package_count:3,package_type:'bottle',container_size:946,container_unit:'ml',unopened_packages:2,partial_package_quantity:950};
 const consumed=consumePantryQuantity(row,1000,'ml');
 assert.equal(consumed.ok,true);
 assert.equal(consumed.updates.unopened_packages,1);
 assert.equal(consumed.updates.partial_package_quantity,896);
 assert.equal(consumed.updates.package_count,2);
 assert.equal(consumed.remaining,1842);
});

test('ordinary measured inventory still uses direct unit conversion',()=>{
 assert.equal(pantryAvailableQuantity({quantity:1,unit:'l'},'ml'),1000);
 assert.equal(pantryAvailableQuantity({quantity:500,unit:'g'},'g'),500);
});
