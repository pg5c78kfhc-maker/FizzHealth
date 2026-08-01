import test from 'node:test';
import assert from 'node:assert/strict';
import {consumeInventory,inventoryAvailableServings} from '../src/inventory/service.js';

const barebells={pantry_id:'P-BAR',food_id:'F-BAR',item:'Barebells Protein Bar',package_type:'container',unit:'container',package_count:13,quantity:13,servings_per_package:1,partial_package_quantity:null,default_serving:55,food_unit:'g',serving_description:'1 bar'};
const apple={pantry_id:'P-APPLE',food_id:'F-APPLE',item:'Apple',package_type:'container',unit:'container',package_count:5,quantity:5,servings_per_package:1,partial_package_quantity:null,default_serving:150,food_unit:'g',serving_description:'1 apple'};

test('explicit serving consumes one Barebells container serving',()=>{
 assert.equal(inventoryAvailableServings(barebells),13);
 const result=consumeInventory(barebells,1,'serving');
 assert.equal(result.ok,true);
 assert.equal(result.usedServings,1);
 assert.equal(result.updates.quantity,12);
});

test('explicit serving consumes one apple despite gram serving basis',()=>{
 assert.equal(inventoryAvailableServings(apple),5);
 const result=consumeInventory(apple,1,'serving');
 assert.equal(result.ok,true);
 assert.equal(result.usedServings,1);
 assert.equal(result.updates.quantity,4);
});

test('two servings consume two tracked units exactly once',()=>{
 const result=consumeInventory(barebells,2,'serving');
 assert.equal(result.ok,true);
 assert.equal(result.usedServings,2);
 assert.equal(result.updates.quantity,11);
});
