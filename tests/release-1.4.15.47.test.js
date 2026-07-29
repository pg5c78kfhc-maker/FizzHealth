import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('release metadata advances to v1.4.15.47',()=>{
 assert.match(app,/VERSION='1\.4\.15\.47'/);
 assert.match(app,/BUILD_ID='141547'/);
 assert.match(app,/DEPLOYMENT_ID='FH-20260729-141547'/);
 assert.match(app,/Food Record Shopping Integration/);
});

test('Shopping is a complete editable Food Record tab',()=>{
 assert.match(app,/recordTab==='shopping'&&<section className="record-tab-panel shopping-record-tab"/);
 assert.match(app,/function ShoppingFoodEditor/);
 assert.match(app,/food-record-shopping-form/);
 assert.match(app,/Preferred retailer/);
 assert.match(app,/Product link/);
 assert.match(app,/Scan \/ Photo/);
 assert.match(app,/Last price/);
 assert.doesNotMatch(app,/recordTab==='shopping'.{0,180}Coming in the next release/s);
});

test('shopping-owned fields are removed from the Inventory tab editor and summary',()=>{
 const inventoryStart=app.indexOf("recordTab==='inventory'&&<section");
 const shoppingStart=app.indexOf("recordTab==='shopping'&&<section",inventoryStart);
 const inventory=app.slice(inventoryStart,shoppingStart);
 assert.doesNotMatch(inventory,/Bought at/);
 assert.doesNotMatch(inventory,/Product link/);
 assert.doesNotMatch(inventory,/Barcode/);
 const editorStart=app.indexOf('function PantryItemEditor');
 const editorEnd=app.indexOf('function singularInventoryUnit',editorStart);
 const editor=app.slice(editorStart,editorEnd);
 assert.doesNotMatch(editor,/Purchase & Product/);
 assert.doesNotMatch(editor,/name="retailer"/);
 assert.doesNotMatch(editor,/name="product_link"/);
 assert.doesNotMatch(editor,/name="barcode"/);
});

test('Shopping uses the approved label-left value-right layout',()=>{
 assert.match(css,/shopping-summary-grid>div\{display:grid;grid-template-columns:minmax\(118px,40%\) minmax\(0,1fr\)/);
 assert.match(css,/shopping-tab-editor \.pantry-property-row\{grid-template-columns:minmax\(118px,40%\) minmax\(0,1fr\)/);
 assert.match(css,/shopping-summary-grid b\{text-align:right/);
});
