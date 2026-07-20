import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterPantryInventory,locationDescendants,pantryEmptyState} from '../src/pantry/query.js';

test('FH-1191 Home aggregates hierarchical child locations',()=>{
 const locations=[{location_id:'home',name:'Home'},{location_id:'fridge',name:'Refrigerator',parent_location_id:'home'},{location_id:'garage',name:'Garage Refrigerator',parent_location_id:'home'}];
 const names=locationDescendants(locations,'Home');
 assert.equal(names.has('refrigerator'),true);
 assert.equal(names.has('garage refrigerator'),true);
});

test('FH-1190 and FH-1196 use one filtered pantry inventory',()=>{
 const locations=[{location_id:'home',name:'Home'},{location_id:'freezer',name:'Freezer',parent_location_id:'home'}];
 const items=[{item:'Salmon',location:'Freezer'},{item:'Yogurt',location:'Refrigerator'}];
 assert.deepEqual(filterPantryInventory(items,{location:'Freezer',locations}).map(x=>x.item),['Salmon']);
 assert.equal(filterPantryInventory(items,{location:'Home',locations}).length,2);
});

test('FH-1195 distinguishes search and location empty states',()=>{
 assert.match(pantryEmptyState({allItems:[{item:'A'}],filteredItems:[],search:'salmon'}).title,/search/i);
 assert.match(pantryEmptyState({allItems:[{item:'A'}],filteredItems:[],location:'Freezer'}).title,/Freezer/);
});

test('v1.4.10 UI removes legacy pantry pills and supports score drilldown manual food and multi-image capture',()=>{
 const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\[\['all','All'\],\['onhand'/);
 assert.match(source,/Pantry Health Score/);
 assert.match(source,/Add food manually/);
 assert.match(source,/multiple onChange/);
 assert.match(source,/universal_photo_capture_images/);
});

test('schema 40 and cache version are present',()=>{
 const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
 const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
 assert.match(db,/TARGET_SCHEMA_VERSION=40/);
 assert.match(db,/version:39/);
 assert.match(db,/version:40/);
 assert.match(sw,/fizz-health-v1\.4\.10\.11/);
});
