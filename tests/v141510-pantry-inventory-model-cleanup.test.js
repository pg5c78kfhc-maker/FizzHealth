import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const pantry=fs.readFileSync(new URL('../src/pantry/intelligence.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('obsolete package state and manual freshness controls are removed',()=>{
 assert.doesNotMatch(main,/Package state/);
 assert.doesNotMatch(main,/name="opened"/);
 assert.doesNotMatch(main,/name="freshness_status"/);
 assert.match(main,/freshnessStatus\(item\)/);
});

test('discontinued is persisted and removed from active inventory intelligence',()=>{
 assert.match(db,/ALTER TABLE pantry ADD COLUMN discontinued INTEGER DEFAULT 0/);
 assert.match(main,/name="discontinued" type="checkbox"/);
 assert.match(main,/if\(Number\(row\.discontinued\)===1\)return false/);
 assert.match(main,/COALESCE\(p\.discontinued,0\)=0/);
 assert.match(pantry,/Number\(item\.discontinued\)===1/);
});

test('serving data is reused from the enriched Food record',()=>{
 assert.match(main,/f\.default_serving,f\.servings_per_container/);
 assert.match(main,/Serving information comes from the canonical Food record and enrichment process/);
 assert.match(main,/pantryServingSize/);
 assert.match(main,/decrementPantryRecord/);
});

test('Pantry editor uses aligned mobile property rows',()=>{
 assert.match(main,/pantry-property-row/);
 assert.match(css,/grid-template-columns:minmax\(120px,44%\) minmax\(0,1fr\)/);
 assert.match(main,/Open package remaining/);
 assert.match(main,/Servings per container/);
});

test('release metadata is centralized and current',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.10'/);
 assert.match(main,/const BUILD_ID='141510'/);
 assert.match(db,/const TARGET_SCHEMA_VERSION=71/);
});
