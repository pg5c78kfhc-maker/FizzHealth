import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('release metadata advances to v1.4.10.43a',()=>{assert.equal(meta.version,'1.4.11.6');assert.equal(meta.build,'141160');assert.match(main,/const VERSION='1\.4\.11\.6'/);});
test('Restaurant Day is date-specific and persisted',()=>{assert.match(main,/daily_preferences WHERE preference_date=\?/);assert.match(main,/restaurant-day-control/);assert.match(main,/role="switch"/);assert.match(main,/restaurant_possible,updated_at/);});
test('restaurant meals force Yes and block contradictory No',()=>{assert.match(main,/restaurantMealExists/);assert.match(main,/Restaurant meal already planned/);assert.match(main,/Remove it before changing Restaurant Day to No/);assert.match(main,/restaurantMealExists\|\|storedRestaurantDay/);});
test('restaurant recommendations are hard-gated',()=>{assert.match(main,/const restaurants=restaurantDay\?optionalQuery/);assert.match(main,/\.\.\.\(restaurantDay\?restaurantOptions:\[\]\)/);});
test('Highest Impact card is constrained for iPhone portrait',()=>{assert.match(css,/highest-impact-trigger\{box-sizing:border-box;max-width:100%;min-width:0/);assert.match(css,/grid-template-columns:76px minmax\(0,1fr\) 18px/);assert.match(css,/overflow-wrap:anywhere/);});
