import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('shared logging context drives both Planner and Library logging',()=>{
 assert.match(source,/function sharedLoggingContext\(/);
 assert.match(source,/context=sharedLoggingContext\(item,sourceType\)/);
 assert.match(source,/loggingContext=sharedLoggingContext\(meal,/);
});
test('Library recipe logs persist actual serving quantity and unit',()=>{
 assert.match(source,/amount:loggingAmount,unit:context\.servingUnit/);
 assert.match(source,/scaled=Object\.fromEntries\(NUTRIENT_KEYS\.map\(key=>\[key,finite\(context\.nutrition\[key\]\)\*portions\]\)\)/);
});
test('recipe resolution uses per-serving snapshot not full batch snapshot',()=>{
 assert.match(source,/if\(type==='recipe'\)\{const snap=recipeServingSnapshot/);
 assert.doesNotMatch(source,/if\(type==='recipe'\)\{const snap=recipeSnapshot\(item\.recipe_id\)/);
});
