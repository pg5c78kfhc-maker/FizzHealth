import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),db=fs.readFileSync('src/database.js','utf8'),meta=JSON.parse(fs.readFileSync('VERSION.json'));
test('meal categories include components and beverage',()=>{for(const x of ['Appetizer','Side','Dessert','Beverage','Condiment'])assert.match(main,new RegExp(x))});
test('planner uses saved meals and date calendar',()=>{assert.match(main,/SELECT \* FROM meal_definitions/);assert.match(main,/MEAL PLANNING PROTOTYPE/);assert.match(main,/RESTAURANT/);assert.doesNotMatch(main,/Plan from pantry foods, recipes, leftovers/)});
test('planner schema supports roles and reservations',()=>{assert.match(db,/ADD COLUMN item_role/);assert.match(db,/ADD COLUMN reserved_calories/)});
test('release metadata is current',()=>{assert.equal(meta.version,'1.4.11.17');assert.equal(meta.schema_version,52)});
