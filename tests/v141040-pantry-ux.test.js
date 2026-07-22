import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const exchange=fs.readFileSync(new URL('../src/exchange.js',import.meta.url),'utf8');
test('v1.4.10.40 identity is canonical',()=>{
 assert.match(main,/const VERSION='1\.4\.10\.40'/);
 assert.match(main,/const BUILD_ID='141040'/);
});
test('missing-data cards use icon-only fixed status column and distinct background',()=>{
 assert.match(main,/r\.confidence>0\?<>{r\.confidence>=75\?<Check\/>:<ShieldCheck\/>}{r\.confidence}%<\/>:<Database\/>/);
 assert.doesNotMatch(main,/<Database\/><X\/> Needs data/);
 assert.match(css,/\.verify-chip\{width:104px;min-width:104px/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card\{background:#18251d/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card \.verify-chip\{background:#263a2d/);
});
test('pantry editor exposes shared enrichment workflow with pantry context',()=>{
 assert.match(main,/aria-label="Enrich linked food"><Pencil\/>/);
 assert.match(main,/<FoodEnrichmentWorkspace food=\{enrichmentFood\}/);
 assert.match(exchange,/inventory_context:\{quantity:food\.pantry_quantity/);
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
