import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const jsx=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('All independently loads foods and recipes',()=>{
 assert.match(jsx,/else \{ foods=optionalQuery\(`SELECT \* FROM foods/);
 assert.match(jsx,/recipes=recipeSearch\(\); \}/);
});
test('empty states are mutually exclusive',()=>{
 assert.match(jsx,/view==='recipes'&&!recipes\.length/);
 assert.match(jsx,/view!=='meals'&&view!=='recipes'&&!foods\.length&&!recipes\.length/);
 assert.doesNotMatch(jsx,/view==='recipes'&&!recipes\.length\?<div/);
});
test('swipe rails remain hidden until active swipe',()=>{
 assert.match(jsx,/discovery-swipe\$\{open\?' is-open':''\}/);
 assert.match(css,/\.discovery-swipe-rail\{[^}]*opacity:0;visibility:hidden;pointer-events:none/s);
 assert.match(css,/\.discovery-swipe\.is-open \.discovery-swipe-rail\{[^}]*opacity:1;visibility:visible;pointer-events:auto/s);
});
test('library uses one bounded results region',()=>{
 assert.match(css,/grid-template-rows:auto auto auto auto minmax\(0,1fr\)/);
 assert.match(css,/\.food-library-page \.list\.foods\{[^}]*overflow-y:auto;overflow-x:hidden/s);
});
test('release metadata is current',()=>{
 assert.match(jsx,/const VERSION='1\.4\.11\.16'/);
 assert.match(jsx,/const BUILD_ID='141251'/);
 assert.match(jsx,/const DEPLOYMENT_ID='FH-20260723-141251'/);
});
