import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pantryAvailableQuantity,consumePantryQuantity} from '../src/inventory/quantity.js';
import {buildFoodEnrichmentExchange} from '../src/exchange.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

const onionRow={
 food_id:'F-ONION',item:'Red Onion',food_name:'Red Onion',package_type:'container',
 quantity:1,package_count:1,inventory_servings_per_package:1,partial_package_quantity:null,
 default_serving:150,food_unit:'g',serving_description:'1 onion',unit:'each',discontinued:0
};

test('live inventory availability resolves one onion through its Food serving definition',()=>{
 assert.equal(pantryAvailableQuantity(onionRow,'onion'),1);
 assert.equal(pantryAvailableQuantity(onionRow,'g'),150);
});

test('live pantry deduction consumes exactly one food-specific serving',()=>{
 const result=consumePantryQuantity(onionRow,1,'onion');
 assert.equal(result.ok,true);
 assert.equal(result.updates.quantity,0);
 assert.equal(result.updates.package_count,0);
 assert.equal(result.updates.status,'Out of Stock');
});

test('recipe availability and deduction queries include Food identity and serving definition',()=>{
 assert.match(main,/f\.name AS food_name,f\.default_serving,f\.unit AS food_unit,f\.serving_description/);
 assert.match(main,/pantryAvailableQuantity\(row,component\.unit\)/);
 assert.match(main,/consumePantryQuantity\(row,usedTarget,component\.unit\)/);
});

test('existing-food enrichment request renders without an undefined barcode reference',()=>{
 const request=buildFoodEnrichmentExchange({food_id:'F1',name:'Test Food',barcode:'0099482535124',default_serving:1,unit:'each'});
 assert.equal(request.target.id,'F1');
 assert.equal(request.proposed_record.barcode,'0099482535124');
 assert.equal(request.existing_record.barcode,'0099482535124');
});
