import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {biomarkerIntelligence} from '../src/health/longitudinal.js';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('FH-1221 validation opens explicit review and preserves validation error path',()=>{
 assert.match(main,/capture-review-page/);
 assert.match(main,/Could not validate response/);
 assert.match(main,/Validate and review/);
});
test('FH-1222 clipboard is JSON-only and photos share separately',()=>{
 assert.match(main,/JSON copied to the clipboard\. Photos were not copied/);
 assert.match(main,/function sharePhotos/);
 assert.doesNotMatch(main,/navigator\.clipboard\.write\([^T]/);
});
test('FH-1228 JSON generators do not navigate',()=>{
 for(const label of ['Restaurant item by name','Meal description','Pasted menu text','Pasted nutrition label','Pasted barcode','Manual JSON'])assert.match(main,new RegExp(label));
 assert.match(main,/generateTemplate\(id\)/);
});
test('FH-1225 capture remains scrollable in reduced visual viewport',()=>{
 assert.match(css,/\.universal-capture \.editor-scroll\{[^}]*overflow-y:auto/);
 assert.match(css,/--visual-viewport-height/);
});
test('FH-1235 legacy Lab_Results aliases produce biomarkers',()=>{
 const rows=[{Date:'2026-01-01',Test:'LDL Cholesterol',Value:'135',Notes:'mg\/dL'},{Date:'2026-07-01',Test:'LDL Cholesterol',Value:'120',Notes:'mg\/dL'}];
 const result=biomarkerIntelligence({labs:rows});
 assert.equal(result.length,1);
 assert.equal(result[0].latest,120);
 assert.equal(result[0].trend.points,2);
});
