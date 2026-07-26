import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release identity includes the v1.4.13.9 presentation baseline or its corrective hotfix',()=>{
 assert.match(version.version,/^1\.4\.13\.9A?$/);
 assert.match(version.build,/^141309A?$/);
 assert.match(version.release_id,/^FH-20260726-141309A?$/);
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
 assert.match(css,/white-menu-list \.restaurant-menu-nutrition\{(?:grid-column:[^;]+;grid-row:[^;]+;)?align-self:end/);
 assert.match(css,/menu-recommendation-row\{align-self:end/);
});
