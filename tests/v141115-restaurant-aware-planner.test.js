import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),db=fs.readFileSync('src/database.js','utf8'),meta=JSON.parse(fs.readFileSync('VERSION.json'));
test('planner has persistent date-specific restaurant toggle',()=>{assert.match(main,/daily_preferences/);assert.match(main,/planner-restaurant-toggle/);assert.match(main,/restaurant_possible/)});
test('restaurant mode creates automatic capacity and actual meals replace it',()=>{assert.match(main,/Restaurant meal — undecided/);assert.match(main,/status='replaced'/);assert.match(main,/source_type:'restaurant'/)});
test('planner supports independent beverage and snack slots',()=>{assert.match(main,/independentCategories=\['Beverage','Snack'\]/)});
test('planner displays saved meal catalog and starred restaurant catalog',()=>{assert.match(main,/AVAILABLE SAVED MEALS/);assert.match(main,/STARRED RESTAURANT MEALS/);assert.match(main,/COALESCE\(rm.favorite,0\)=1/)});
test('release metadata is current',()=>{assert.equal(meta.version,'1.4.11.18');assert.equal(meta.schema_version,53);assert.match(db,/version:52/)});
