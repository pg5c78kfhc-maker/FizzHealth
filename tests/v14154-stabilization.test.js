import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
test('Meals categories are collapsed by default and preserve controlled expansion state',()=>{
 assert.match(main,/expandedCategories.*new Set/);
 assert.match(main,/open=\{expandedCategories\.has\(group\.category\)\}/);
 assert.doesNotMatch(main,/builder-category-section[^\n]*\sopen>/);
});
test('Meals category editor preserves scroll position',()=>{
 assert.match(main,/returnScrollRef\.current=libraryListRef\.current\?\.scrollTop/);
 assert.match(main,/libraryListRef\.current\.scrollTop=returnScrollRef\.current/);
});
test('Food detail exposes edit action',()=>{
 assert.match(main,/aria-label="Edit food nutrition"/);
 assert.match(main,/editingFood&&<NutritionEditor/);
});
test('Startup has bounded recovery timeout',()=>{
 assert.match(main,/withStartupTimeout\(openDatabase/);
 assert.match(main,/15000,'Database startup did not complete within 15 seconds\.'/);
});
test('Menu layout is viewport-contained with no Chef gap',()=>{
 assert.match(css,/\.meal-calendar-prototype \.chef-section\+\.menu-category\{margin-top:0!important/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto 26px!important/);
 assert.match(css,/overflow-x:hidden!important/);
});
test('release metadata identifies v1.4.15.4',()=>{
 assert.equal(version.version,'1.4.15.4');
 assert.equal(version.build,'141504');
 assert.equal(version.release_id,'FH-20260727-141504');
 assert.equal(version.schema_version,69);
});
