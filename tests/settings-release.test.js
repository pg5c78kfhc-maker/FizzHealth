import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
test('v1.4.0 settings hub and focused pages are present',()=>{
 assert.match(src,/About & release notes/);
 assert.match(src,/Database import & export/);
 assert.match(src,/Schema JSON/);
 assert.match(src,/Archived items/);
 assert.match(src,/Maintenance & audit/);
});
test('release metadata includes timestamp and story traceability',()=>{
 assert.equal(version.version,'1.4.10.13');
 assert.ok(version.created_at.includes('T'));
 assert.ok(version.stories.includes('FH-1223'));  
 assert.equal(version.baseline_story,'FH-1221');
 assert.match(src,/View full release history/);
 assert.match(src,/FH-1099/);
 assert.match(src,/HF-012/);
});
test('food and recipe gestures include quick log and archive',()=>{
 assert.match(src,/swipe-quick/);
 assert.match(src,/Add as proposed meal/);
 assert.match(src,/Add as consumed meal/);
 assert.match(src,/Archive .*Historical meal/s);
 assert.match(src,/restoreFood/);
 assert.match(src,/restoreRecipe/);
});
