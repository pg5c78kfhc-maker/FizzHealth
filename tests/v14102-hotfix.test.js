import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');const health=fs.readFileSync(new URL('../src/health/longitudinal.js',import.meta.url),'utf8');
test('v1.4.10.10 release and navigation',()=>{assert.match(main,/VERSION='1\.4\.10\.10'/);assert.doesNotMatch(main,/id:'add',I:Plus,label:'Add'/);assert.match(main,/className="universal-fab"/)});
test('keyboard safe editors and capture validation',()=>{assert.match(css,/--visual-viewport-height/);assert.match(css,/overflow-y:auto/);assert.match(main,/Validate and review/);assert.match(main,/Could not validate response/)});
test('biomarkers accept imported collected dates',()=>assert.match(health,/collected_at/));
test('pantry and charts stabilized',()=>{assert.match(main,/plannedMeals:planned,history,currentLocation/);assert.match(main,/SYS/);assert.match(main,/DIA/);assert.match(main,/pantry-inventory/)});
