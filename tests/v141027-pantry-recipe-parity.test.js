import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPantryIntelligence,pantryHealthScore} from '../src/pantry/intelligence.js';
import {filterPantryInventory} from '../src/pantry/query.js';

test('All location includes every household storage location',()=>{
 const items=[{item:'A',location:'Refrigerator'},{item:'B',location:'Standalone Freezer'}];
 assert.equal(filterPantryInventory(items,{location:'All',locations:[]}).length,2);
});

test('out of stock is separated from active pantry and restock',()=>{
 const intel=buildPantryIntelligence({items:[
  {pantry_id:'1',item:'In stock',quantity:2,unit:'item',on_hand:'Yes',location:'Pantry'},
  {pantry_id:'2',item:'Empty',quantity:0,unit:'item',on_hand:'No',location:'Pantry'}
 ],currentLocation:'All'});
 assert.equal(intel.items.filter(x=>x.available).length,1);
 assert.equal(intel.outOfStock.length,1);
 assert.equal(intel.outOfStock[0].item,'Empty');
});

test('empty score is unavailable rather than misleading zero',()=>{
 const score=pantryHealthScore([{item:'Empty',quantity:0,on_hand:'No'}]);
 assert.equal(score.score,null);
 assert.equal(score.label,'Not calculated');
});

test('in-stock inventory produces eat-next recommendations across All locations',()=>{
 const intel=buildPantryIntelligence({items:[{pantry_id:'1',item:'Yogurt',quantity:4,unit:'serving',on_hand:'Yes',location:'Refrigerator',protein:18,fiber:1}],currentLocation:'All'});
 assert.equal(intel.recommendations.length,1);
 assert.equal(intel.recommendations[0].item,'Yogurt');
});
