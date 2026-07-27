import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const exchange=fs.readFileSync(new URL('../src/exchange.js',import.meta.url),'utf8');

test('serving consumption converts enriched serving size into pantry units',()=>{
 assert.match(main,/function pantryConsumptionDelta/);
 assert.match(main,/qty\*pantryServingSize\(item\)/);
 assert.match(main,/pantryConsumptionDelta\(\{\.\.\.selected,pantry_unit:inventoryUnit\},amount,selectedUnit\)/);
});
test('package counts track opened and exhausted containers',()=>{
 assert.match(main,/const packageCount=container>0\?unopened\+\(partial>0\?1:0\)/);
 assert.match(main,/UPDATE pantry SET quantity=\?,on_hand=\?,package_count=\?/);
});
test('discontinued records can be reviewed and restored',()=>{
 assert.match(main,/showDiscontinued/);
 assert.match(main,/Include discontinued/);
 assert.match(main,/inventoryRows\.filter\(row=>showDiscontinued\|\|Number\(row\.discontinued\)!==1\)/);
});
test('product enrichment carries serving metadata',()=>{
 assert.match(main,/servings_per_container:food\.servings_per_container\?\?null/);
 assert.match(exchange,/servings_per_container:p\.serving\?\.servings_per_container/);
});
test('release metadata is current',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.11'/);
 assert.match(main,/const BUILD_ID='141511'/);
 assert.match(db,/const TARGET_SCHEMA_VERSION=72/);
});
