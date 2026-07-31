import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const editor=main.slice(main.indexOf('function PantryItemEditor'),main.indexOf('function singularInventoryUnit',main.indexOf('function PantryItemEditor')));
const labels=['Serving size','Servings per container','Containers in stock','Servings remaining in open container','Storage location','Best by date'];

test('information and edit pages use the approved Inventory fields in the approved order',()=>{
 for(const label of labels){
  assert.ok(main.includes(`label=\"${label}\"`),`information page missing ${label}`);
  assert.ok(editor.includes(`label=\"${label}\"`),`editor missing ${label}`);
 }
 const positions=labels.map(label=>editor.indexOf(`label=\"${label}\"`));
 for(let i=1;i<positions.length;i++)assert.ok(positions[i]>positions[i-1],`${labels[i]} is out of order`);
});

test('package type and explicit open-container controls are removed from the Inventory editor',()=>{
 for(const obsolete of ['Package type','Servings per package','Packages on hand','Open package','Open container','Servings left','Stored at','Measured directly']){
  assert.ok(!editor.includes(`label=\"${obsolete}\"`),`${obsolete} remains in the editor`);
 }
 assert.ok(!editor.includes('name=\"package_type\"'));
 assert.ok(!editor.includes('name=\"opened\"'));
});

test('open-container state is inferred from an optional remaining-servings value',()=>{
 assert.match(editor,/const hasPartial=containerCountValue>0&&partialContainerQuantity!==null/);
 assert.match(editor,/hasPartial\?'Yes':'No'/);
 assert.match(editor,/placeholder=\"Leave blank if none\"/);
});

test('all Inventory help text comes from one shared definition source',()=>{
 assert.match(main,/const INVENTORY_FIELD_DEFINITIONS=/);
 for(const label of labels)assert.ok(main.includes(`'${label}'`),`definition missing ${label}`);
 assert.match(main,/document\.addEventListener\('pointerdown',close\)/);
 assert.match(main,/role=\"tooltip\"/);
});
