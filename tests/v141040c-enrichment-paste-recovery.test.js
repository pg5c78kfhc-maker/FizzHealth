import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const history=JSON.parse(fs.readFileSync(new URL('../release-history.json',import.meta.url),'utf8'));
const workspace=main.slice(main.indexOf('function FoodEnrichmentWorkspace'),main.indexOf('function NutritionEditor'));

test('v1.4.10.40c metadata is current',()=>{
 assert.equal(meta.version,'1.4.10.40c');
 assert.equal(meta.build,'141040C');
 assert.equal(meta.completed_story,'FH-40C-1');
 assert.match(main,/const VERSION='1\.4\.10\.40c'/);
 assert.match(main,/const BUILD_ID='141040C'/);
 assert.equal(history.releases[0].version,'1.4.10.40c');
});

test('Pantry enrichment paste-to-review does not reference nonexistent currentFood state',()=>{
 assert.doesNotMatch(workspace,/currentFood/);
 assert.match(workspace,/<h3>\{food\.name\}<\/h3>/);
 assert.match(workspace,/params\.push\(food\.food_id\)/);
 assert.match(workspace,/const whereParams=table==='meals'\?\[food\.food_id/);
});

test('valid paste stays in workflow and advances to review while invalid paste remains recoverable',()=>{
 assert.match(workspace,/setResponse\(normalized\);setPreview\(payload\);setMessage\('Response validated/);
 assert.match(workspace,/catch\(error\)\{setPreview\(null\);setMessage\(error instanceof Error\?`Validation failed:/);
 assert.match(workspace,/if\(preview\)return <div className="modal-backdrop enrichment-modal">/);
 assert.match(workspace,/onClick=\{pasteResponse\}/);
});
