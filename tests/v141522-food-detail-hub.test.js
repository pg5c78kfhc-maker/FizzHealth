import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const start=main.indexOf('function MenuInformationView');
const end=main.indexOf('const CHEF_IMAGE_CACHE_KEY',start);
const view=main.slice(start,end);

test('Menu Food Detail promotes Decision Intelligence and removes redundant Add to Meals',()=>{
 assert.match(view,/DECISION INTELLIGENCE/);
 assert.ok(view.indexOf('DECISION INTELLIGENCE')<view.indexOf('NUTRITION &amp; DATA QUALITY'));
 assert.doesNotMatch(view,/Add to Meals/);
});

test('Menu Food Detail reuses canonical enrichment and Pantry editors',()=>{
 assert.match(view,/FoodEnrichmentWorkspace/);
 assert.match(view,/PantryItemEditor/);
 assert.match(view,/setEnrichmentFood\(canonicalFood\)/);
 assert.match(view,/aria-label={`Edit inventory for/);
});

test('Menu Food Detail shows recipe ingredient inventory status',()=>{
 assert.match(view,/COMPONENTS &amp; INGREDIENTS/);
 assert.match(view,/recipeRows\.map/);
 assert.match(view,/pantry_quantity/);
 assert.match(view,/Not tracked in Pantry/);
});

test('Food Detail hub has scoped responsive styling',()=>{
 assert.match(styles,/v1\.4\.15\.22 — Menu Food Detail operational hub/);
 assert.match(styles,/\.food-detail-hub/);
 assert.match(styles,/\.food-hub-pencil/);
});
