import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('v1.4.13.6 adds swipe gestures without removing tap-to-add',()=>{
 assert.match(main,/function MenuSwipeCard/);
 assert.match(main,/onAdd\(meal\)/);
 assert.match(main,/function PlannedOrderSwipe/);
 assert.match(css,/menu-swipe-rail/);
});
test('Chef recommendations are integrated into the Menu ranking',()=>{
 assert.match(main,/evaluateDecision\('chef_rank'/);
 assert.match(main,/Chef’s Recommendations/);
 assert.match(main,/pantryRows/);
 assert.match(main,/restaurantPossible:restaurantDay/);
});
test('Decision Intelligence explains and highlights dynamically ranked choices',()=>{
 assert.match(main,/menuDecisionRank/);
 assert.match(main,/menuDecisionWhy/);
 assert.match(main,/decision-pick-badge/);
 assert.match(main,/menuDecisionScore-a\.menuDecisionScore/);
});
