import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const exchange=fs.readFileSync(new URL('../src/exchange.js',import.meta.url),'utf8');
test('missing-data cards use icon-only fixed status column and distinct background',()=>{
 assert.match(main,/completion\.complete\?\(r\.confidence>0\?<>{r\.confidence>=75\?<Check\/>:<ShieldCheck\/>}{r\.confidence}%<\/>:<Check\/>\):<Database\/>/);
 assert.doesNotMatch(main,/<Database\/><X\/> Needs data/);
 assert.match(css,/\.verify-chip\{width:104px;min-width:104px/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card\{background:#263a2d/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card \.verify-chip\{background:inherit/);
});
test('pantry editor exposes package structure and direct save',()=>{
 assert.match(main,/Packages on hand/);
 assert.match(main,/Size per package/);
 assert.match(main,/partial_package_quantity/);
 assert.match(main,/aria-label="Save pantry item"/);
});
test('location browsing defaults to All and excludes Home',()=>{
 assert.match(main,/useState\('All'\)/);
 assert.match(main,/browsingLocations=locations\.filter\(location=>.*!==['"]home['"]/);
 assert.match(main,/<option value="All">All<\/option>\{browsingLocations\.map/);
});
test('pantry search is a separate screen and filter results are actionable',()=>{
 assert.match(main,/setShowSearch\(true\)/);
 assert.match(main,/title|Search Pantry/);
 assert.doesNotMatch(main,/<label className="search pantry-search"><Search\/><input value=\{q\}/);
 assert.match(main,/view==='restock'.*onClick=\{\(\)=>openRecord\(r\)\}/s);
 assert.match(main,/view==='shopping'.*onClick=\{\(\)=>openRecord\(r\)\}/s);
 assert.match(main,/view==='out'.*<InventoryCard/s);
});
