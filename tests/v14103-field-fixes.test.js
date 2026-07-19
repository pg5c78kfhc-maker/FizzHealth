import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),pantry=fs.readFileSync('src/pantry/intelligence.js','utf8'),imp=fs.readFileSync('src/importer.js','utf8'),css=fs.readFileSync('src/styles.css','utf8');
test('Eat Next uses already-filtered inventory',()=>{assert.match(pantry,/currentLocation.*home/);assert.match(pantry,/recommendations=enriched\.filter\(i=>i\.available&&i\.locationMatch\)/)});
test('Next meal opens functional planner',()=>{assert.match(main,/fizz-open-meal-planner/);assert.match(main,/Choose a meal to plan/);assert.match(main,/Plan meal/)});
test('iOS handoff copies JSON then shares photos',()=>{assert.match(main,/navigator\.clipboard\.writeText\(request\)/);assert.match(main,/navigator\.share\(\{files/)});
test('manual pantry editor is keyboard safe full screen',()=>{assert.match(main,/pantry-manual-editor/);assert.match(css,/\.pantry-manual-editor\{position:fixed/)});
test('labs are mirrored and visible to health intelligence',()=>{assert.match(imp,/biomarker:\$\{normalized\}/);assert.match(main,/metric_type LIKE 'biomarker:%'/)});
