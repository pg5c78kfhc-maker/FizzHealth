import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('release metadata is v1.4.15.101',()=>{
  assert.match(main,/const VERSION='1\.4\.15\.101'/);
  assert.match(main,/const BUILD_ID='1415101'/);
});
test('missing one-sided range bounds are not coerced to zero',()=>{
  assert.match(main,/function labBound\(value\).*value===null\|\|value===undefined/);
  assert.match(main,/if\(op==='>'\)return value>range\.low\?'in':'out'/);
  assert.match(main,/if\(op==='<'\)return value<range\.high\?'in':'out'/);
});
test('scaled lab visualization is rendered',()=>{
  assert.match(main,/function labScale\(row\)/);
  assert.match(main,/function LabProgressBar\(\{row\}\)/);
  assert.match(main,/<LabProgressBar row=\{row\}\/>/);
  assert.match(css,/\.lab-progress-track/);
  assert.match(css,/\.lab-progress-marker/);
});
test('Labs card uses Labs label rather than biomarkers',()=>{
  assert.match(main,/health-labs-label/);
  assert.doesNotMatch(main,/\$\{labBiomarkers\} biomarkers/);
});
