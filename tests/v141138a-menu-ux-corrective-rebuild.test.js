import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('release metadata identifies v1.4.13.8A consistently',()=>{
 assert.equal(meta.version,'1.4.13.8A');
 assert.equal(meta.build,'141308A');
 assert.equal(meta.release_id,'FH-20260726-141308A');
 assert.match(main,/const VERSION='1\.4\.13\.8A'/);
 assert.match(main,/const BUILD_ID='141308A'/);
 assert.match(main,/const DEPLOYMENT_ID='FH-20260726-141308A'/);
});

test("Chef section is labeled Chef's Picks and Powered by AI",()=>{
 assert.match(main,/>Chef's Picks</);
 assert.match(main,/>Powered by AI</);
 assert.doesNotMatch(main,/>Chef Recommendations</);
});

test('food cards remove priority and navigation arrows while preserving favorite and tap-to-add',()=>{
 const card=main.slice(main.indexOf('function MenuSwipeCard'),main.indexOf('function PlannedOrderSwipe'));
 assert.match(card,/favorite-star/);
 assert.match(card,/if\(!wasMoved\)onAdd\(meal\)/);
 assert.doesNotMatch(card,/Increase priority/);
 assert.doesNotMatch(card,/Decrease priority/);
 assert.doesNotMatch(card,/<MoveRight\/>/);
 assert.match(card,/<small>kcal<\/small>/);
 assert.match(card,/<small>protein<\/small>/);
});

test('collapsible headings use serif typography and right-side counts',()=>{
 assert.match(css,/\.menu-category-heading h3,\.meal-service-head h3,\.planned-meals-heading h3\{font-family:Georgia/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto auto/);
 assert.match(main,/<span>\{section\.items\.length\}<\/span>/);
 assert.match(main,/<span>\{items\.length\}<\/span>/);
});

test('Menu bottom navigation is anchored and safe-area space is reserved',()=>{
 assert.match(css,/\.menu-page-shell\{padding-bottom:calc\(var\(--bottom-nav-height\) \+ 34px\)\}/);
 assert.match(css,/\.menu-page-shell nav,body\.menu-page-active nav\{position:fixed/);
});
