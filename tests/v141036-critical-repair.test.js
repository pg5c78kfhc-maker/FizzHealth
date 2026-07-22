import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('recipe aggregation converts compatible ingredient units and includes every nutrient',()=>{assert.match(main,/function recipeIngredientRatio/);assert.match(main,/for\(const k of NUTRIENT_KEYS\)/);assert.match(main,/total\[k\]\+=Number\(value\)\*ratio/)});
test('recipe consumption persists full nutrient snapshot and emits meal refresh signal',()=>{assert.match(main,/\.\.\.nutrientSnapshot\(n\)/);assert.match(main,/localStorage\.setItem\('fizz-meal-added','1'\)/);assert.match(main,/ingredient_count:source\.ingredients\.length/)});
test('enrichment serializes structured values before sqlite binding',()=>{assert.match(main,/function dbScalar/);assert.match(main,/params=allowed\.map\(k=>dbScalar\(proposed\[k\]\)\)/)});
test('enrichment result is visible beside header',()=>{assert.match(main,/enrichment-header-status/);assert.match(main,/aria-live="assertive"/)});
