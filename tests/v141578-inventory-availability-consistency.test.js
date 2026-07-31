import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pantryAvailableQuantity} from '../src/inventory/quantity.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('blank open-container quantity treats every container as full',()=>{
 const apple={package_type:'container',unit:'each',food_unit:'each',default_serving:1,servings_per_package:1,package_count:3,quantity:3,partial_package_quantity:null,unopened_packages:0};
 assert.equal(pantryAvailableQuantity(apple,'each'),3);
});

test('a positive open-container quantity replaces one full container',()=>{
 const sandwiches={package_type:'container',unit:'each',food_unit:'each',default_serving:1,servings_per_package:12,package_count:1,quantity:1,partial_package_quantity:3,unopened_packages:1};
 assert.equal(pantryAvailableQuantity(sandwiches,'each'),3);
 const twoContainers={...sandwiches,package_count:2,quantity:2};
 assert.equal(pantryAvailableQuantity(twoContainers,'each'),15);
});

test('selection cards use compact bracketed counts without the word remaining',()=>{
 assert.match(main,/formatInventoryCount\(meal\.availableServings\)\}\]`/);
 assert.doesNotMatch(main,/formatInventoryCount\(meal\.availableServings\)\}\s+remaining/);
});

test('inventory help icon remains inline with the wrapped label',()=>{
 assert.match(main,/inventory-field-label-text/);
 assert.match(css,/\.inventory-field-label-text \.inventory-info-button\{display:inline-grid/);
});
