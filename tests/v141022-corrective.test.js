import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('v1.4.10.26 release identity is canonical',()=>{
 assert.equal(pkg.version,'1.4.10.26');
 assert.match(main,/const VERSION='1\.4\.10\.26'/);
 assert.match(main,/const BUILD_ID='141026'/);
});

test('global plus opens Add Food and legacy Universal Capture is removed',()=>{
 assert.match(main,/className="universal-fab" aria-label="Add food" onClick=\{\(\)=>visit\('add'\)\}/);
 assert.doesNotMatch(main,/function UniversalCapture/);
 assert.doesNotMatch(main,/UNIVERSAL PHOTO CAPTURE|Open Universal Capture|What happened\?/);
});

test('Add Food actions are visible and retain New Food and Log Once intent',()=>{
 assert.match(main,/className="add-food-actions"/);
 assert.match(main,/<Plus\/><span>New Food<\/span>/);
 assert.match(main,/<Zap\/><span>Log Once<\/span>/);
 assert.match(css,/\.add-food-actions button:first-child\{background:var\(--panel\);color:#fff\}/);
 assert.match(css,/\.add-food-actions button svg\{color:#fff;stroke:#fff\}/);
});

test('AI Exchange has an explicit clipboard response action',()=>{
 const matches=main.match(/Paste Response/g)||[];
 assert.ok(matches.length>=2);
 assert.match(main,/className="secondary clipboard-response-button" onClick=\{readClipboard\}/);
 assert.match(main,/className="secondary clipboard-response-button" onClick=\{pasteResponse\}/);
});

test('restaurant detail reads are resilient and legacy capture card is absent',()=>{
 assert.match(main,/function Restaurants\(\{refresh,done\}\)/);
 assert.match(main,/function RestaurantExchangeWorkspace/);
 assert.match(main,/standard-page-head/);
 assert.match(main,/Replace menu/);
 assert.doesNotMatch(main,/RestaurantUniversalCapture/);
});
