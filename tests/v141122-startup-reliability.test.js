import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('startup hotfix metadata is current',()=>{
  assert.equal(meta.version,'1.4.11.22');
  assert.equal(meta.build,'141122');
  assert.equal(meta.release_id,'FH-20260724-141122');
  assert.match(main,/const VERSION='1\.4\.11\.22'/);
});

test('startup no longer has fatal 12 or 15 second timeout',()=>{
  assert.doesNotMatch(main,/Database startup timed out/);
  assert.doesNotMatch(main,/setTimeout\(\(\)=>reject[\s\S]{0,120}12000/);
  assert.doesNotMatch(main,/could not finish loading[\s\S]{0,160}15000/);
});

test('startup reports progress and preserves real error',()=>{
  assert.match(main,/openDatabase\(\{onProgress:setBootStage\}\)/);
  assert.match(main,/Startup stage: \{bootStage\}/);
  assert.match(main,/console\.error\('Fizz Health startup failed'/);
});

test('schema reconciliation runs after migration loop, not for every migration',()=>{
  const loop=database.slice(database.indexOf('for(let index=0;index<pending.length;index++)'),database.indexOf('const repairMarker='));
  assert.doesNotMatch(loop,/reconcileImportSchema/);
  assert.match(database,/const needsRepair=pending\.length===0&&!alreadyRepaired/);
  assert.match(database,/reconcileImportSchema\(\{apply:true\}\)/);
});
