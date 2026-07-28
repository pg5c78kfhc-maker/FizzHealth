import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Food Detail pencil opens the one canonical NutritionEditor above detail page',()=>{
 assert.match(main,/onClick=\{\(\)=>setEditingFood\(true\)\} aria-label="Edit food nutrition"/);
 assert.match(main,/\{editingFood&&<NutritionEditor food=\{source\}/);
 assert.equal((main.match(/function NutritionEditor\(/g)||[]).length,1);
 assert.match(css,/\.modal-backdrop\.nutrition-modal\{z-index:2700\}/);
});

test('Menu category expansion remains in normal flow',()=>{
 assert.match(main,/open&&<div className="menu-category-grid white-menu-list">/);
 assert.match(css,/today-menu>\.menu-category\{display:block;position:relative;clear:both;isolation:isolate\}/);
 assert.match(css,/white-menu-list\{display:block!important;position:relative;float:none;clear:both;height:auto/);
});

test('Pantry wording uses contained food unit rather than package type',()=>{
 assert.match(main,/const containedUnit=item\.food_unit\|\|item\.serving_unit\|\|item\.unit\|\|'item'/);
 assert.match(main,/How many \$\{pluralInventoryUnit\(containedUnit\)\} are left in the open \$\{packageName\}\?/);
 assert.doesNotMatch(main,/How many \$\{pluralInventoryUnit\(packageName\)/);
});

test('Pantry swiping is attached only to inventory cards',()=>{
 assert.match(main,/function PantrySwipeCard\(/);
 assert.match(main,/const InventoryCard=\(\{r\}\)=>.*<PantrySwipeCard/s);
 assert.doesNotMatch(main,/return <PantrySwipeCard[^>]*><><div className="standard-page-head/s);
 assert.match(css,/\.pantry-row-swipe\{position:relative;display:block;overflow:hidden;border-radius:16px;touch-action:pan-y\}/);
});
