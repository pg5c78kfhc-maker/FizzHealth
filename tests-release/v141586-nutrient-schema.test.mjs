import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const db=fs.readFileSync('src/database.js','utf8'),main=fs.readFileSync('src/main.jsx','utf8'),pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const nutrients=['calories','protein','carbs','fiber','fat','saturated_fat','trans_fat','cholesterol','sodium','potassium','total_sugar','added_sugar','monounsaturated_fat','polyunsaturated_fat','omega_3','calcium','iron','magnesium','vitamin_d','vitamin_c','alcohol','caffeine'];
const tables=['foods','meals','planned_meals','restaurant_meals','meal_definitions','meal_components'];
test('metadata',()=>{assert.equal(pkg.version,'1.4.15.86');assert.match(main,/VERSION='1\.4\.15\.86'/);assert.match(db,/TARGET_SCHEMA_VERSION=96/)});
test('migration complete',()=>{for(const t of tables)for(const n of nutrients)assert.ok(db.includes(`ALTER TABLE ${t} ADD COLUMN ${n} REAL;`),`${t}.${n}`)});
test('canonical registry drives reconciliation',()=>{assert.ok(db.includes("import {NUTRIENT_KEYS} from './nutrition/registry.js'"));assert.ok(db.includes('canonicalNutrientColumns=Object.freeze(Object.fromEntries(NUTRIENT_KEYS.map'));for(const t of tables){const i=db.indexOf(`${t}:{`,db.indexOf('const canonicalSchema='));assert.ok(i>=0,t);assert.ok(db.slice(i,i+3000).includes('...canonicalNutrientColumns'),t)}});
test('prepared update checks live columns',()=>{assert.ok(main.includes('PRAGMA table_info(foods)'));assert.ok(main.includes('persistedNutrients=NUTRIENT_KEYS.filter(key=>foodColumns.has(key))') )});
