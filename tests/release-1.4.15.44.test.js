import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('release metadata is current',()=>{
 assert.match(main,/VERSION='1\.4\.15\.44'/);
 assert.match(main,/BUILD_ID='141544'/);
 assert.match(main,/DEPLOYMENT_ID='FH-20260729-141544'/);
});
test('parent Food Record owns edit actions',()=>{
 assert.match(main,/activeRecordEditor\?<button type="submit" form=\{activeRecordFormId\|\|undefined\}/);
 assert.match(main,/activeRecordEditor\?\(\)=>editorCancelRef\.current\?\.\(\):onClose/);
});
test('Nutrition editor is embedded under the Nutrition tab',()=>{
 assert.match(main,/editingFood&&!isRecipe\?<NutritionEditor food=\{source\} embedded formId="food-record-nutrition-form"/);
 assert.match(main,/nutrition-tab-editor-shell/);
 assert.doesNotMatch(main,/\{editingFood&&<NutritionEditor food=\{source\}/);
});
test('Inventory editor uses parent shell controls',()=>{
 assert.match(main,/embedded formId="food-record-inventory-form"/);
 assert.match(main,/\{!embedded&&<div className="edit-head sticky-head"/);
});
test('embedded editors retain canonical save paths',()=>{
 assert.match(main,/UPDATE pantry SET item=\?,brand=\?,retailer=\?,product_link=\?/);
 assert.match(main,/UPDATE foods SET \$\{assignments\.join\(','\)\} WHERE food_id=\?/);
});
test('tabs remain present while editors are active',()=>{
 assert.match(main,/className="record-detail-tabs"/);
 assert.match(main,/disabled=\{activeRecordEditor\}/);
});
test('embedded editor styling removes nested full-screen shells',()=>{
 assert.match(css,/\.nutrition-tab-editor\{position:relative!important/);
 assert.match(css,/\.pantry-tab-editor \.editor-scroll\{padding-top:18px!important\}/);
});
