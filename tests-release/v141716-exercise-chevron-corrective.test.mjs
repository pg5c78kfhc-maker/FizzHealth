import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../src/styles.css', import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx', import.meta.url),'utf8');

test('exercise disclosure chevron is absolutely anchored to centered bottom edge',()=>{
  assert.match(css,/\.nested-exercise-toggle>svg\s*\{[\s\S]*position:absolute;[\s\S]*left:50%;[\s\S]*bottom:9px;[\s\S]*transform:translateX\(-50%\)/);
});

test('exercise toggle no longer reserves a third grid column for disclosure',()=>{
  assert.match(css,/v1\.4\.17\.16[\s\S]*\.nested-exercise-toggle\s*\{[\s\S]*grid-template-columns:30px minmax\(0,1fr\)/);
});

test('exercise header releases legacy right-side layout reservation',()=>{
  assert.match(css,/v1\.4\.17\.16[\s\S]*\.nested-exercise-header\s*\{\s*padding-right:0;/);
});

test('exercise action buttons remain intact',()=>{
  assert.match(main,/className="exercise-card-actions"/);
  assert.match(main,/setEditor\(\{type:'exercise'/);
  assert.match(main,/setEditor\(\{type:'set'/);
});

test('release metadata is v1.4.17.16',()=>{
  assert.match(main,/const VERSION='1\.4\.17\.16'/);
});

test('program and workout disclosure patterns remain bottom-edge anchored',()=>{
  assert.match(css,/active-program-card \.workout-program-open>svg\{[\s\S]*position:absolute;[\s\S]*left:50%;[\s\S]*bottom:10px/);
  assert.match(css,/\.nested-workout-toggle>svg\{[\s\S]*position:absolute;[\s\S]*left:50%;[\s\S]*bottom:10px/);
});

test('exercise chevron still flips with exercise expansion state',()=>{
  assert.match(main,/exerciseOpen\?<ChevronUp\/>:<ChevronDown\/>/);
});
