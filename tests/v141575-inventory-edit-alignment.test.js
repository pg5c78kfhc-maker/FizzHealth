import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const start=source.indexOf('function PantryItemEditor');
const end=source.indexOf('function singularInventoryUnit',start);
const editor=source.slice(start,end);

test('inventory editor mirrors information wording and order',()=>{
 const labels=['Serving size','Package type','Servings per package','Packages on hand','Open package','Servings left','Stored at','Best by'];
 for(const label of labels) assert.ok(editor.includes(`label="${label}"`),`missing ${label}`);
 const positions=labels.map(label=>editor.indexOf(`label="${label}"`));
 for(let i=1;i<positions.length;i++) assert.ok(positions[i]>positions[i-1],`${labels[i]} is out of order`);
});

test('obsolete duplicate package fields are removed from visible editor',()=>{
 for(const label of ['Package size','Sealed packages','Package open']) assert.ok(!editor.includes(`label="${label}"`),`${label} remains visible`);
});

test('non-packaged mode keeps only direct quantity controls',()=>{
 assert.ok(editor.includes('label="On hand"'));
 assert.ok(editor.includes('name="quantity"'));
 assert.ok(editor.includes('name="serving_size"'));
 assert.ok(editor.includes('name="serving_unit"'));
});
