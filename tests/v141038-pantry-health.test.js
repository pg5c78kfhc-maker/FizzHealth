import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateAvailableServings,inventoryState,pantryHealthScore} from '../src/pantry/intelligence.js';

test('null remaining_servings does not erase a positive pantry quantity',()=>{
 const item={quantity:10,remaining_servings:null,default_serving:1,on_hand:'Yes'};
 assert.equal(inventoryState(item),'in_stock');
 assert.equal(calculateAvailableServings(item),10);
});

test('pantry health evaluates the same in-stock records shown by inventory',()=>{
 const items=[
  {pantry_id:'1',quantity:10,remaining_servings:null,on_hand:'Yes',category:'Breakfast',protein:12,fiber:2,calories:220,locationMatch:true,verified_at:new Date().toISOString()},
  {pantry_id:'2',quantity:1,remaining_servings:null,on_hand:'Yes',category:'Protein',protein:24,fiber:0,calories:180,locationMatch:true,verified_at:new Date().toISOString()},
  {pantry_id:'3',quantity:0,remaining_servings:null,on_hand:'No',category:'Snack',locationMatch:true}
 ];
 const result=pantryHealthScore(items,[],Date.now());
 assert.equal(result.activeCount,2);
 assert.equal(typeof result.score,'number');
 assert.ok(result.score>=0&&result.score<=100);
 assert.match(result.reason,/2 in-stock items evaluated/);
});

test('unknown quantity marked on hand contributes to health rather than becoming false zero',()=>{
 const item={quantity:null,remaining_servings:null,on_hand:'Yes',category:'Pantry',locationMatch:true};
 assert.equal(inventoryState(item),'in_stock');
 assert.equal(calculateAvailableServings(item),1);
 const result=pantryHealthScore([item],[],Date.now());
 assert.equal(result.activeCount,1);
 assert.equal(typeof result.score,'number');
});
