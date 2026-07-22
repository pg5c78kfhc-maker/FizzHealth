import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const history=JSON.parse(fs.readFileSync(new URL('../release-history.json',import.meta.url),'utf8'));

test('v1.4.10.40b metadata is current',()=>{
 assert.equal(meta.version,'1.4.10.40b');assert.equal(meta.build,'141040B');
 assert.match(main,/const VERSION='1\.4\.10\.40b'/);assert.match(main,/const BUILD_ID='141040B'/);
 assert.equal(history.releases[0].version,'1.4.10.40b');assert.match(main,/\{version:'1\.4\.10\.40b'/);
});

test('Pantry Pencil opens the full nutrition editor instead of AI Exchange',()=>{
 const editor=main.slice(main.indexOf('function PantryItemEditor'),main.indexOf('function Pantry({'));
 assert.match(editor,/setNutritionFood\(rows\[0\]\)/);
 assert.match(editor,/<NutritionEditor food=\{nutritionFood\}/);
 assert.doesNotMatch(editor,/<FoodEnrichmentWorkspace food=\{enrichmentFood\}/);
});

test('full nutrition editor explains exact completion requirements',()=>{
 assert.match(main,/const REQUIRED_NUTRITION_FIELDS=Object\.freeze/);
 assert.match(main,/function nutritionCompletion/);
 assert.match(main,/NUTRITION STATUS/);
 assert.match(main,/completion\.missing\.map/);
 assert.match(main,/This food satisfies the Pantry nutrition requirement/);
 assert.match(css,/\.nutrition-completion\.incomplete/);
});

test('enrichment recalculates completion and returns to refreshed full editor',()=>{
 const enrich=main.slice(main.indexOf('function FoodEnrichmentWorkspace'),main.indexOf('function NutritionEditor'));
 const nutrition=main.slice(main.indexOf('function NutritionEditor'),main.indexOf('const EXCHANGE_VERSION'));
 assert.match(enrich,/nutritionCompletion\(\{\.\.\.food,\.\.\.proposed\}\)\.complete\?1:0/);
 assert.match(nutrition,/SELECT \* FROM foods WHERE food_id=\? LIMIT 1/);
 assert.match(nutrition,/setForm\(makeForm\(fresh\)\)/);
 assert.match(nutrition,/Enrichment applied\. Review the updated nutrition record below/);
});

test('Pantry card completeness is based on nutrition fields, not inventory confidence',()=>{
 assert.match(main,/const InventoryCard=\(\{r\}\)=>\{const completion=nutritionCompletion/);
 assert.match(main,/!completion\.complete\?'needs-data-card'/);
 assert.match(main,/!completion\.complete\?'missing-data'/);
 assert.match(main,/completion\.complete.*:<Database\/>/s);
});
