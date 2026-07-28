import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Pantry uses inline search instead of a search navigation page',()=>{
 assert.match(main,/className="search pantry-inline-search"/);
 assert.doesNotMatch(main,/setShowSearch\(/);
 assert.doesNotMatch(main,/Search Pantry<\/h2>/);
});

test('Pantry editor exposes linked recipe ingredient editing',()=>{
 assert.match(main,/Edit recipe ingredients/);
 assert.match(main,/editingRecipe&&<RecipeCreateEditor/);
 assert.match(main,/SwipeDeleteIngredient/);
});

test('Pantry rows restore both swipe directions',()=>{
 assert.match(main,/onArchive=\{\(\)=>archivePantry\(r\)\}/);
 assert.match(main,/onQuickLog=\{\(\)=>quickLogPantry\(r\)\}/);
 assert.match(main,/onFullSwipe=\{\(\)=>quickLogPantry\(r\)\}/);
});

test('Inventory editor derives total from unopened and open-container amounts',()=>{
 assert.match(main,/unopenedPackages\*containerSize\+partialPackageQuantity/);
 assert.match(main,/How many full unopened/);
 assert.match(main,/are left in the open/);
 assert.doesNotMatch(main,/label="Packages on hand"/);
});

test('expanded Menu categories preserve their heading container',()=>{
 assert.match(css,/today-menu>\.menu-category>\.menu-category-heading\{display:grid!important;visibility:visible!important/);
 assert.match(css,/today-menu>\.menu-category\{display:grid!important;grid-template-rows:auto auto!important;overflow:hidden!important\}/);
});
