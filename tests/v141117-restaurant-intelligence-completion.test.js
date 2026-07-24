import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateRestaurantExchange} from '../src/exchange.js';
import {explainNutritionConfidence} from '../src/restaurant/intelligence.js';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release metadata advances to v1.4.11.20',()=>{assert.equal(meta.version,'1.4.11.20');assert.equal(meta.build,'141320');assert.match(main,/const VERSION='1\.4\.11\.20'/)});
test('append menu exchange is explicit and non-destructive',()=>{const payload={format:'fizz-health-exchange',schema_version:3,request_type:'universal_exchange',request_id:'append-1',operation:'append_menu_items',target:{type:'restaurant',id:'R1',create_if_missing:false},proposed_record:{menu:{sections:[{name:'Dinner',items:[{meal_name:'Fish'}]}]}}};assert.doesNotThrow(()=>validateRestaurantExchange(payload,{operation:'append_menu_items',targetId:'R1'}));assert.match(main,/operation==='append_menu_items'/);assert.match(main,/Existing menu items remain active/)});
test('restaurant cards show price and labeled confidence',()=>{assert.match(main,/restaurant-price-badge/);assert.match(main,/Price unknown/);assert.doesNotMatch(main,/>Confidence<\/small>/);assert.match(css,/restaurant-price-badge/)});
test('restaurant detail uses standard left back control',()=>{assert.match(main,/restaurant-detail-standard-head/);assert.match(main,/aria-label="Back"><ChevronLeft/)});
test('confidence explanation is evidence driven',()=>{const result=explainNutritionConfidence({confidence:.8,source:'ai_exchange',calories:300,protein:25,assumptions_json:'["portion estimated"]'});assert.equal(result.score,80);assert.ok(result.deductions.length);assert.ok(result.improvements.length);assert.deepEqual(result.assumptions,['portion estimated']);assert.match(main,/Why confidence was reduced/)});
