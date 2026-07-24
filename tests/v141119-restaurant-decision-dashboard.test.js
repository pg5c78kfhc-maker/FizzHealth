import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),css=fs.readFileSync('src/styles.css','utf8'),meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));
test('release metadata identifies restaurant decision dashboard',()=>{assert.equal(meta.version,'1.4.11.19');assert.equal(meta.build,'141319')});
test('cards show meaningful descriptions and ranking rationale',()=>{assert.match(main,/restaurantDishDescription/);assert.match(main,/WHY IT RANKS/);assert.doesNotMatch(main,/decision\.action<\/small>/)});
test('cards show goal-focused metrics and adaptive contrast',()=>{assert.match(main,/Cholesterol/);assert.match(main,/Sat\. fat/);assert.match(css,/restaurant-metric\.danger/);assert.match(css,/--metric-fg:#fff/)});
test('price stays in a prominent pill above rank',()=>{assert.match(main,/restaurant-card-left/);assert.match(css,/restaurant-price-badge\{font-size:1\.18rem/)});
