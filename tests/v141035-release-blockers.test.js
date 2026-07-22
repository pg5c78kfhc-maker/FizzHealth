import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Meals screen uses Meals terminology',()=>{
 assert.match(main,/<small>MEALS<\/small><h1>Meals<\/h1>/);
});

test('Pantry is inventory-only and no longer owns What Should I Eat',()=>{
 const pantry=main.slice(main.indexOf('function Pantry({'),main.indexOf('function AIExchangeWorkspace'));
 assert.match(pantry,/PANTRY INVENTORY/);
 assert.match(pantry,/Inventory control/);
 assert.doesNotMatch(pantry,/What should I eat\?/i);
 assert.doesNotMatch(pantry,/Eat next/);
 assert.doesNotMatch(pantry,/Chef’s Recommendations/);
 assert.doesNotMatch(pantry,/Waste risk/);
});

test('What Should I Eat is a standalone Meals-owned page',()=>{
 assert.match(main,/navigate\('food-intelligence'\)/);
 assert.match(main,/function FoodIntelligencePage/);
 assert.match(main,/PageShell eyebrow="FOOD INTELLIGENCE" title="What Should I Eat\?"/);
});

test('recipe snapshot aggregates the complete nutrient registry',()=>{
 assert.match(main,/const total=Object\.fromEntries\(NUTRIENT_KEYS\.map\(k=>\[k,0\]\)\)/);
 assert.match(main,/for\(const k of NUTRIENT_KEYS\).*total\[k\]\+=Number\(value\)\*ratio/s);
 assert.match(main,/nutrientColumns=NUTRIENT_KEYS\.map/);
});

test('ingredient enrichment recalculates linked recipe meals',()=>{
 assert.match(main,/affectedRecipes=db\.query/);
 assert.match(main,/recipeSnapshotFrom/);
 assert.match(main,/food_id=\?/);
 assert.match(main,/recipe:\$\{snap\.recipe_id\}/);
});

test('enrichment approval gives visible feedback and formats evidence objects',()=>{
 assert.match(main,/function evidenceText/);
 assert.match(main,/enrichment-header-status/);
 assert.match(css,/\.enrichment-sticky-status/);
 assert.match(main,/disabled=\{busy\}/);
});
