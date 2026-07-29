import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('inventory embedded editor preserves two-column mobile layout',()=>{
 assert.match(css,/\.pantry-tab-editor \.pantry-property-row\{[\s\S]*grid-template-columns:minmax\(104px,38%\) minmax\(0,1fr\)!important/);
 assert.match(css,/\.pantry-tab-editor \.pantry-property-row>div\{text-align:right!important\}/);
});
test('release metadata is current',()=>{
 assert.match(app,/VERSION='1\.4\.15\.46'/);
 assert.match(app,/BUILD_ID='141546'/);
 assert.match(app,/DEPLOYMENT_ID='FH-20260729-141546'/);
});
