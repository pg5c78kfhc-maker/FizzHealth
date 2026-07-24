import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseExchangeJson,restaurantMenuItems,validateRestaurantExchange} from '../src/exchange.js';

const payload={format:'fizz-health-exchange',schema_version:3,request_type:'universal_exchange',request_id:'restaurant-replace_menu-1',operation:'replace_menu',target:{type:'restaurant',id:'R1',create_if_missing:false},proposed_record:{restaurant:{name:'Dolores'},menu:{sections:[{name:'Lunch',items:[{name:'Miso Salmon',price:26.99,description:'Vegetables'}]},{name:'Dinner',items:[{name:'Tuna Tartar',nutrition:{calories:420,protein_g:35}}]}]}},analysis:{confidence:95},review:{requires_user_approval:true}};

test('repairs smart quotes and code fences before strict parsing',()=>{
 const smart=`\uFEFF\n\`\`\`json\n${JSON.stringify(payload).replaceAll('"','“')}\n\`\`\``;
 const parsed=parseExchangeJson(smart);
 assert.equal(parsed.payload.operation,'replace_menu');
 assert.equal(parsed.repaired,true);
});

test('section-based restaurant menus become importable rows',()=>{
 validateRestaurantExchange(payload,{operation:'replace_menu',targetId:'R1'});
 const items=restaurantMenuItems(payload);
 assert.equal(items.length,2);
 assert.equal(items[0].category,'Lunch');
 assert.equal(items[0].serving_description,'Vegetables');
 assert.equal(items[1].calories,420);
 assert.equal(items[1].protein,35);
});

test('restaurant exchange UI contains review, apply, and completion states',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(main,/Validate & review/);
 assert.match(main,/VALIDATED IMPORT/);
 assert.match(main,/Import complete/);
 assert.match(main,/restaurantMenuItems\(payload\)/);
});

test('release metadata identifies 1.4.11.19 deployment',()=>{
 const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
 assert.equal(meta.version,'1.4.11.19');
 assert.equal(meta.build,'141319');
 assert.equal(meta.release_id,'FH-20260723-141319');
});

test('repairs smart-quoted nested JSON strings and converts them to structured values',()=>{
 const malformed='{“format”:“fizz-health-exchange”,“schema_version”:3,“request_type”:“universal_exchange”,“request_id”:“x”,“operation”:“enrich_menu_item”,“target”:{“type”:“restaurant_menu_item”,“id”:139,“create_if_missing”:false},“proposed_record”:{“menu”:{“sections”:[{“name”:“Margaritas”,“items”:[{“meal_name”:“Cilantro Margarita”,“ingredients_json”:”["tequila","lime juice"]”,“nutrition_completeness_json”:”{"estimated":true,"coverage":0.96}”}]}]}},“analysis”:{},“review”:{“requires_user_approval”:true}}';
 const parsed=parseExchangeJson(malformed);
 assert.deepEqual(parsed.payload.proposed_record.menu.sections[0].items[0].ingredients_json,['tequila','lime juice']);
 assert.equal(parsed.payload.proposed_record.menu.sections[0].items[0].nutrition_completeness_json.coverage,0.96);
});

test('repairs trailing commas and reports schema separately from syntax',()=>{
 const text='{"format":"fizz-health-exchange","schema_version":3,"request_type":"universal_exchange","request_id":"x","operation":"replace_menu","target":{"type":"restaurant","id":"R1","create_if_missing":false,},"proposed_record":{"menu":{"sections":[{"name":"Dinner","items":[{"meal_name":"Fish",},],},],},},}';
 const parsed=parseExchangeJson(text);
 assert.equal(parsed.payload.target.id,'R1');
 assert.doesNotThrow(()=>validateRestaurantExchange(parsed.payload,{operation:'replace_menu',targetId:'R1'}));
});
