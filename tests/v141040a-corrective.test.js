import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const history=JSON.parse(fs.readFileSync(new URL('../release-history.json',import.meta.url),'utf8'));

test('v1.4.10.40a release identity is canonical and visible',()=>{
 assert.equal(meta.version,'1.4.10.40a');
 assert.equal(meta.build,'141040A');
 assert.equal(meta.release_id,'FH-20260722-141040A');
 assert.match(main,/const VERSION='1\.4\.10\.40a'/);
 assert.match(main,/const BUILD_ID='141040A'/);
 assert.equal(history.releases[0].version,'1.4.10.40a');
 assert.match(main,/const RELEASE_HISTORY=\[\n \{version:'1\.4\.10\.40a'/);
});

test('complete and incomplete pantry cards use one horizontal fill each',()=>{
 assert.match(css,/\.pantry-smart-item\{[^}]*background:#17211b/);
 assert.match(css,/\.verify-chip\{[^}]*background:inherit/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card\{background:#263a2d/);
 assert.match(css,/\.pantry-smart-item\.needs-data-card \.verify-chip\{background:inherit/);
});

test('pantry enrichment is mounted outside its parent form so clipboard actions cannot dismiss the editor',()=>{
 const editor=main.slice(main.indexOf('function PantryItemEditor'),main.indexOf('function Pantry({'));
 assert.match(editor,/<\/form><\/div>\{enrichmentFood&&<FoodEnrichmentWorkspace/);
 assert.doesNotMatch(editor,/<FoodEnrichmentWorkspace[^>]+\/>\}<\/form>/);
});

test('Paste Response validates and advances directly to the review screen',()=>{
 const workspace=main.slice(main.indexOf('function FoodEnrichmentWorkspace'),main.indexOf('function NutritionEditor'));
 assert.match(workspace,/async function pasteResponse\(\)\{try\{const normalized=normalizeUniversalJson\(await navigator\.clipboard\.readText\(\)\),payload=validateUniversalExchange/);
 assert.match(workspace,/setPreview\(payload\);setMessage\('Response validated\. Review all proposed changes before importing\.'/);
 assert.doesNotMatch(workspace,/Response pasted\. Tap Review/);
});
