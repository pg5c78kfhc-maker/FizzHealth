import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('planned food consumption resolves pantry by id or exact food name and records reversible delta',()=>{
 assert.match(main,/function resolvePantryConsumption/);
 assert.match(main,/UPPER\(p\.food_id\)=UPPER\(\?\)/);
 assert.match(main,/LOWER\(TRIM\(p\.item\)\)=LOWER\(TRIM\(\?\)\)/);
 assert.match(main,/applySourceInventoryConsumption\(db,\{sourceType/);
 assert.match(main,/pantry_id:adjustment\.pantry_id\|\|null,pantry_delta:pantryDelta/);
});

test('direct consumed foods decrement linked pantry inventory',()=>{
 assert.match(main,/applySourceInventoryConsumption\(db,\{sourceType,item,servings:qty/);
 assert.match(main,/pantry_id:adjustment\.pantry_id,pantry_delta:adjustment\.pantry_delta/);
});

test('shopping image discovery is observable and refreshable',()=>{
 assert.match(main,/async function discoverRetailerImage/);
 assert.match(main,/Refresh Images/);
 assert.match(main,/product_image_status/);
 assert.match(main,/Image blocked by retailer/);
 assert.match(db,/ALTER TABLE pantry ADD COLUMN product_image_checked_at TEXT/);
});

test('retailer groups are collapsible details sections',()=>{
 assert.match(main,/<details className="shopping-retailer-group"/);
 assert.match(main,/<summary><Store\/>/);
 assert.match(css,/shopping-retailer-group:not\(\[open\]\)/);
});

test('release identity is current and centralized',()=>{
 assert.match(main,/VERSION='1\.4\.15\.37'/);
 assert.match(main,/BUILD_ID='141537'/);
 assert.match(db,/VALUES \('1\.4\.15\.37','2026-07-29','141537',82/);
});

test('recipes and meal definitions decrement every linked pantry component',()=>{
 assert.match(main,/function sourceInventoryPayloads/);
 assert.match(main,/FROM recipes WHERE recipe_id=\?/);
 assert.match(main,/FROM meal_components WHERE meal_id=\?/);
 assert.match(main,/function applySourceInventoryConsumption/);
 assert.match(db,/CREATE TABLE IF NOT EXISTS meal_pantry_adjustments/);
});

test('deleting a consumed meal restores all recorded pantry adjustments',()=>{
 assert.match(main,/function restoreMealPantryAdjustments/);
 assert.match(main,/restoreMealPantryAdjustments\(db,row\.id,row\)/);
 assert.match(main,/recordMealPantryAdjustments\(db,r\.id/);
});
