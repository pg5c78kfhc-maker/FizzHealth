import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release identity is v1.4.13.9',()=>{
 assert.equal(version.version,'1.4.13.9');
 assert.equal(version.build,'141309');
 assert.equal(version.release_id,'FH-20260726-141309');
});

test('Menu cards use compact recommendation indicators without visible rank badges',()=>{
 assert.match(source,/function menuRecommendationIndicators/);
 assert.match(source,/items\.slice\(0,4\)/);
 assert.match(source,/menu-recommendation-row/);
 assert.doesNotMatch(source,/<Sparkles\/> #\{meal\.menuDecisionRank\}/);
 assert.match(css,/\.decision-pick-badge,.menu-decision-why\{display:none!important\}/);
});

test('legacy promoted-from display is stripped from card descriptions',()=>{
 assert.match(source,/replace\(\/\(\?:\^\|\\n\)\\s\*Promoted from/);
});

test('category headers use Menu sans-serif hierarchy and item counts',()=>{
 assert.match(css,/menu-category-heading h3[\s\S]*font-family:system-ui/);
 assert.match(css,/menu-category-heading:after/);
 assert.match(source,/chefPicks\.length===1\?'item':'items'/);
});

test('macros align at the recommendation row',()=>{
 assert.match(css,/white-menu-list \.restaurant-menu-nutrition\{align-self:end/);
 assert.match(css,/menu-recommendation-row\{align-self:end/);
});
