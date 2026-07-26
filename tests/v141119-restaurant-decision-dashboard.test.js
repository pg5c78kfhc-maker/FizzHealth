import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),css=fs.readFileSync('src/styles.css','utf8'),meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));
test('release metadata identifies restaurant decision dashboard',()=>{assert.equal(meta.version,'1.4.11.22');assert.equal(meta.build,'141122')});
test('cards show meaningful descriptions and ranking rationale',()=>{assert.match(main,/restaurantDishDescription/);assert.match(main,/WHY IT RANKS/);assert.doesNotMatch(main,/decision\.action<\/small>/)});
test('cards show goal-focused metrics and adaptive contrast',()=>{assert.match(main,/label="Chol"/);assert.match(main,/label="Sat Fat"/);assert.match(css,/restaurant-metric\.danger/);assert.match(css,/--metric-fg:#fff/)});
test('price stays in a prominent pill beside rank',()=>{assert.match(main,/restaurant-card-topline/);assert.match(css,/restaurant-card-topline \.restaurant-price-badge/)});
