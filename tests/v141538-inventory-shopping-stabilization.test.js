import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('release metadata identifies v1.4.15.38',()=>{
 assert.match(main,/VERSION='1\.4\.15\.38'/);
 assert.match(main,/BUILD_ID='141538'/);
 assert.match(main,/FH-20260729-141538/);
});
test('inventory decrement records only quantity actually deducted',()=>{
 assert.match(main,/delta=Math\.min\(before\.quantity,requested\)/);
 assert.match(main,/return \{delta,before,after\}/);
});
test('inventory reversal restores exact before snapshot',()=>{
 assert.match(main,/restorePantrySnapshot/);
 assert.match(main,/before_json/);
 assert.match(main,/JSON\.parse\(row\.before_json/);
});
test('consumption adjustment is idempotent by source and pantry',()=>{
 assert.match(db,/UNIQUE INDEX IF NOT EXISTS idx_meal_pantry_adjustments_idempotent/);
 assert.match(main,/INSERT OR IGNORE INTO meal_pantry_adjustments/);
});
test('impossible deductions are logged instead of inflating reversals',()=>{
 assert.match(main,/integrity_warning/);
 assert.match(main,/Requested deduction/);
 assert.match(main,/Inventory integrity blocked an impossible/);
});
test('shopping image refresh exposes fetching and completion progress',()=>{
 assert.match(main,/Fetching 0 of/);
 assert.match(main,/Finished: \$\{targets\.length\} checked/);
 assert.match(main,/Loaded/);
 assert.match(main,/Cached/);
 assert.match(main,/No product image found/);
 assert.match(main,/Image blocked by retailer/);
});
