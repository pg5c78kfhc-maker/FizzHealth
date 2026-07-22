import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateAvailableServings,buildPantryIntelligence} from '../src/pantry/intelligence.js';

test('expired freshness does not mean out of stock',()=>{
 const item={pantry_id:'P1',item:'Yogurt',on_hand:'Yes',quantity:2,default_serving:1,status:'Expired',expiration:'2026-07-01'};
 assert.equal(calculateAvailableServings(item),2);
 const intel=buildPantryIntelligence({items:[item],currentLocation:'All',now:Date.parse('2026-07-21')});
 assert.equal(intel.items[0].available,true);
 assert.equal(intel.recommendations.length,1);
 assert.notEqual(intel.health.score,null);
});

test('positive quantity overrides stale depletion flags',()=>{
 const item={pantry_id:'P2',item:'Coffee',on_hand:'No',quantity:4,status:'Depleted'};
 assert.equal(calculateAvailableServings(item),4);
 const intel=buildPantryIntelligence({items:[item],currentLocation:'All'});
 assert.equal(intel.outOfStock.length,0);
 assert.equal(intel.recommendations.length,1);
});

test('zero quantity is the only out-of-stock inventory state',()=>{
 const item={pantry_id:'P3',item:'Coffee',on_hand:'Yes',quantity:0,status:'Active'};
 const intel=buildPantryIntelligence({items:[item],currentLocation:'All'});
 assert.equal(intel.outOfStock.length,1);
 assert.equal(intel.recommendations.length,0);
});
