import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inventoryState,reconcilePantryItem} from '../src/pantry/intelligence.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('explicit out-of-stock state wins over stale positive quantity',()=>{
 assert.equal(inventoryState({quantity:4,on_hand:'No',status:'Active'}),'out_of_stock');
 assert.equal(inventoryState({quantity:4,on_hand:'Yes',status:'Out of Stock'}),'out_of_stock');
 assert.equal(inventoryState({quantity:4,on_hand:'Yes',status:'Active'}),'in_stock');
});

test('inventory events synchronize quantity, on-hand, and status',()=>{
 const consumed=reconcilePantryItem({quantity:1,on_hand:'Yes',status:'Active'},{event_type:'consume',quantity:1});
 assert.deepEqual([consumed.quantity,consumed.on_hand,consumed.status],[0,'No','Out of Stock']);
 const restocked=reconcilePantryItem(consumed,{event_type:'restock',quantity:2});
 assert.deepEqual([restocked.quantity,restocked.on_hand,restocked.status],[2,'Yes','Active']);
});

test('Manage Meals library does not apply pantry availability filtering',()=>{
 const libraryBlock=main.slice(main.indexOf("const search=`%${q}%`"),main.indexOf('const favoriteIds=',main.indexOf("const search=`%${q}%`")));
 assert.ok(libraryBlock.includes('Manage → Meals is the canonical library'));
 assert.ok(!libraryBlock.includes('availability.foodAvailable'));
 assert.ok(!libraryBlock.includes('availability.recipeAvailable'));
 assert.ok(!libraryBlock.includes('availability.mealAvailable'));
 assert.ok(main.includes('.filter(row=>availability.itemAvailable(row))'),'Menu must retain availability filtering');
});

test('schema migration reconciles contradictory Pantry records',()=>{
 assert.ok(database.includes("version:73,name:'pantry_state_and_meals_library_repair'"));
 assert.ok(database.includes("status='Out of Stock'"));
 assert.ok(database.includes("status='Active'"));
});
