import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const history=JSON.parse(fs.readFileSync(new URL('../release-history.json',import.meta.url),'utf8'));

test('v1.4.10.40a remains preserved in release history',()=>{
 assert.ok(history.releases.some(r=>r.version==='1.4.10.40a'));
 assert.match(main,/\{version:'1\.4\.10\.40a'/);
});

test('complete and incomplete pantry cards retain one horizontal fill each',()=>{
 assert.match(css,/\.pantry-smart-item\{[^}]*background:#17211b/);
 assert.match(css,/\.verify-chip\{[^}]*background:inherit/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card\{background:#263a2d/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card \.verify-chip\{background:inherit/);
});

test('Pantry nutrition and enrichment overlays are mounted outside the inventory form',()=>{
 const editor=main.slice(main.indexOf('function PantryItemEditor'),main.indexOf('function Pantry({'));
 assert.match(editor,/<\/form><\/div>\{nutritionFood&&<NutritionEditor/);
});

test('Paste Response validates and advances directly to the review screen',()=>{
 const workspace=main.slice(main.indexOf('function FoodEnrichmentWorkspace'),main.indexOf('function NutritionEditor'));
 assert.match(workspace,/async function pasteResponse\(\)\{try\{const normalized=normalizeUniversalJson\(await navigator\.clipboard\.readText\(\)\),payload=validateUniversalExchange/);
 assert.match(workspace,/setPreview\(payload\);setMessage\('Response validated\. Review all proposed changes before importing\.'/);
 assert.doesNotMatch(workspace,/Response pasted\. Tap Review/);
});
