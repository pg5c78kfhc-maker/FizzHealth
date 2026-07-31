import test from 'node:test';
import assert from 'node:assert/strict';
import {pantryAvailableQuantity} from '../src/inventory/quantity.js';
import fs from 'node:fs';

const openBox={package_type:'container',package_count:1,unopened_packages:0,partial_package_quantity:3,container_size:12,container_unit:'each',servings_per_package:12,default_serving:1,food_unit:'each',quantity:1,unit:'containers'};

test('open container availability uses remaining servings instead of full capacity',()=>{
 assert.equal(pantryAvailableQuantity(openBox,'each'),3);
});

test('sealed plus open containers are combined',()=>{
 assert.equal(pantryAvailableQuantity({...openBox,package_count:3,unopened_packages:2},'each'),27);
});

test('menu and library use shared availability and remaining-title presentation',()=>{
 const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(source,/pantryAvailableQuantity\(row,item\.unit/);
 assert.match(source,/\[\$\{formatInventoryCount\(meal\.availableServings\)\} remaining\]/);
 assert.match(source,/inventory-field-label-text/);
});
