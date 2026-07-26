import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release identity is v1.4.14.1',()=>{
 assert.equal(version.version,'1.4.14.1');
 assert.equal(version.build,'141401');
 assert.equal(version.release_id,'FH-20260726-141401');
 assert.deepEqual(version.stories,['FH-1414.1','FH-1414.2','FH-1414.9','FH-1414.10']);
});

test('Chef Picks starts collapsed',()=>{
 assert.match(source,/openSections,setOpenSections\]=useState\(\(\)=>new Set\(\)\)/);
 assert.doesNotMatch(source,/new Set\(\["Chef's Picks"\]\)/);
});

test('right swipe distinguishes reveal from hard-swipe commit',()=>{
 assert.match(source,/distance>=112/);
 assert.match(source,/distance>=34/);
 assert.match(source,/setOffset\(88\)/);
 assert.match(source,/onAdd\(meal\)/);
});

test('only one menu swipe row remains open',()=>{
 assert.match(source,/openSwipeKey,setOpenSwipeKey/);
 assert.match(source,/if\(openSwipeKey!==swipeKey\)setOffset\(0\)/);
 assert.match(source,/onSwipeOpen=\{setOpenSwipeKey\}/);
});

test('Add to Meals supports multi-select meal containers and standard header actions',()=>{
 for(const slot of ['Breakfast','Lunch','Dinner','Snack','Beverage']) assert.match(source,new RegExp(`['\"]${slot}['\"]`));
 assert.match(source,/Add to Meals/);
 assert.match(source,/togglePickerSlot/);
 assert.match(source,/saveAddToMeals/);
 assert.match(source,/aria-label="Cancel"/);
 assert.match(source,/aria-label="Save meal assignments"/);
 assert.match(css,/\.multi-select-meals button\.selected/);
});

test('favorite controls share one persisted preference state including restaurant items',()=>{
 assert.match(source,/const toggleFavorite=.*persistPrefs/);
 assert.match(source,/onFavorite=\{toggleFavorite\}/);
 assert.match(source,/menuFavorite:Boolean\(prefFor\(\{planner_source:'restaurant'/);
 assert.match(source,/Star fill=\{meal\.menuFavorite\?'currentColor':'none'\}/);
});
