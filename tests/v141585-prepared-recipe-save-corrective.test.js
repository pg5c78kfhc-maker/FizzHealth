import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {consumeInventory,inventoryAvailableQuantity} from '../src/inventory/service.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('one 150 g Red Onion serving is available and deducts exactly once',()=>{
 const onion={pantry_id:'P-ONION',food_id:'F-ONION',item:'Red Onion',food_name:'Red Onion',quantity:1,unit:'containers',package_count:1,package_type:'container',servings_per_package:1,partial_package_quantity:null,default_serving:150,food_unit:'g',discontinued:0};
 assert.equal(inventoryAvailableQuantity(onion,'g'),150);
 const result=consumeInventory(onion,150,'g',{caller:'Batch preparation',recipeId:'R-DAILY-SALAD'});
 assert.equal(result.ok,true);
 assert.equal(result.used,150);
 assert.equal(result.updates.quantity,0);
 assert.equal(result.updates.status,'Out of Stock');
});

test('prepared recipe deduction cannot silently skip a failed matched row',()=>{
 assert.match(main,/if\(!consumed\.ok\)\{\s*throw new Error/);
 assert.match(main,/if\(required>EPSILON\)throw new Error/);
 assert.match(main,/required=Math\.max\(0,required-used\)/);
 assert.match(main,/WHERE pantry_id=\?/);
});

test('prepared recipe save error is rendered immediately below the header',()=>{
 assert.match(main,/prepared-recipe-save-error/);
 assert.doesNotMatch(main,/Inventory accounting[\s\S]{0,300}\{error&&<div className="inline-error"/);
});

test('prepared recipe editor stops above the persistent footer and active Save is green',()=>{
 assert.match(css,/v1\.4\.15\.85 — Prepared Recipe save and footer corrective/);
 assert.match(css,/height:calc\(var\(--visual-viewport-height,100dvh\) - var\(--bottom-nav-height,88px\)/);
 assert.match(css,/\.recipe-pantry-batch \.edit-head \.save-action\{color:#a5ef38!important;opacity:1!important\}/);
 assert.match(css,/\.save-action:disabled\{color:#8fa1aa!important;opacity:\.35!important\}/);
});
