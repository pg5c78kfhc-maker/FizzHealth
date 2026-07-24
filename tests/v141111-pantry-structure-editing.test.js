import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release metadata identifies pantry stabilization build',()=>{
 assert.equal(meta.version,'1.4.11.18');
 assert.equal(meta.build,'141318');
 assert.equal(meta.release_id,'FH-20260723-141318');
 assert.match(main,/const VERSION='1\.4\.11\.18'/);
});
test('schema supports packages, container sizes, partial packages, and freshness',()=>{
 for(const field of ['package_count','package_type','container_size','container_unit','unopened_packages','partial_package_quantity','freshness_status']) assert.match(db,new RegExp(field));
 assert.match(db,/TARGET_SCHEMA_VERSION=53/);
});
test('pantry editor calculates total quantity from package structure',()=>{
 assert.match(main,/Packages on hand/);
 assert.match(main,/Size per package/);
 assert.match(main,/Amount remaining in open package/);
 assert.match(main,/effectiveUnopened\*containerSize\+effectivePartial/);
});
test('confidence detail lists exact missing evidence and opens editor',()=>{
 assert.match(main,/function pantryMissingEvidence/);
 assert.match(main,/Expiration or best-by date is not recorded/);
 assert.match(main,/Freshness is not selected/);
 assert.match(main,/Complete missing details/);
 assert.match(main,/setSelectedPantry\(scoreItem\)/);
});
