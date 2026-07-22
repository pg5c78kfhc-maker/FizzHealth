import test from 'node:test';
import assert from 'node:assert/strict';
import {inventoryState,buildPantryIntelligence} from '../src/pantry/intelligence.js';

test('quantity is the pantry inventory source of truth',()=>{
 const stocked={pantry_id:'P1',item:'Sandwiches',quantity:10,on_hand:'No',status:'Expired',expiration:'2026-07-01'};
 assert.equal(inventoryState(stocked),'in_stock');
 const intel=buildPantryIntelligence({items:[stocked],currentLocation:'All',now:Date.parse('2026-07-21')});
 assert.equal(intel.items[0].available,true);
 assert.equal(intel.outOfStock.length,0);
 assert.equal(intel.recommendations.length,1);
 assert.notEqual(intel.health.score,null);
});

test('zero quantity is out of stock regardless of stale flags',()=>{
 const empty={pantry_id:'P2',item:'Empty',quantity:0,on_hand:'Yes',status:'Active'};
 assert.equal(inventoryState(empty),'out_of_stock');
 const intel=buildPantryIntelligence({items:[empty],currentLocation:'All'});
 assert.equal(intel.outOfStock.length,1);
 assert.equal(intel.items[0].available,false);
});
