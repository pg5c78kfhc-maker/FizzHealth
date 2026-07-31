import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {foodQuantityToGrams,scaleFoodQuantity} from '../src/nutrition/units.js';
import {buildNewFoodExchange} from '../src/exchange.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('food-specific ingredient units resolve through the food serving definition',()=>{
 const onion={name:'Red Onion',default_serving:150,unit:'g'};
 assert.deepEqual(foodQuantityToGrams({amount:1,amountUnit:'onion',food:onion}).grams,150);
 assert.deepEqual(foodQuantityToGrams({amount:2,amountUnit:'onions',food:onion}).grams,300);
 const apple={name:'Honeycrisp Apple',default_serving:125,unit:'g'};
 assert.equal(foodQuantityToGrams({amount:1,amountUnit:'apple',food:apple}).grams,125);
 const egg={name:'Cage-Free Large Egg',default_serving:50,unit:'g'};
 assert.equal(scaleFoodQuantity({amount:3,amountUnit:'eggs',food:egg}).ratio,3);
});

test('existing direct and serving-description conversions remain unchanged',()=>{
 const food={name:'Red Onion',default_serving:150,unit:'g',serving_description:'1 medium onion'};
 assert.equal(foodQuantityToGrams({amount:75,amountUnit:'g',food}).grams,75);
 assert.equal(foodQuantityToGrams({amount:1,amountUnit:'medium onion',food}).grams,150);
});

test('Library search row includes a barcode scan control and reuses CameraBarcodeScanner',()=>{
 assert.match(main,/className="library-search-row"/);
 assert.match(main,/aria-label="Scan barcode to find a product"/);
 assert.match(main,/showLibraryScanner&&<CameraBarcodeScanner/);
 assert.match(css,/\.library-search-row\{display:grid;grid-template-columns:minmax\(0,1fr\) 64px/);
});

test('known barcodes open the Food record and unknown barcodes prefill New Food',()=>{
 assert.match(main,/LEFT JOIN food_barcodes fb/);
 assert.match(main,/setRecipeDetail\(\{type:'food',\.\.\.existing\}\)/);
 assert.match(main,/setAiExchange\(\{operation:'create_food',initialBarcode:code\}\)/);
 const request=buildNewFoodExchange({barcode:'077900310997'});
 assert.equal(request.proposed_record.barcode,'077900310997');
});
