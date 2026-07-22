import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Home hierarchy preserves summaries before expandable intelligence and operational content',()=>{
  assert.match(main,/className="today-meals-section"/);
  assert.match(css,/\.decision-intelligence-disclosure\{order:1/);
  assert.match(css,/\.home-key-summaries\{order:2/);
  assert.match(css,/\.decision-intelligence-content\{order:3/);
  assert.match(css,/\.today-view>\.today-meals-section\{order:4\}/);
  assert.match(css,/\.today-view>\.command-center\{order:5\}/);
});

test('Take Action routes calories to meal planner and steps to metric entry',()=>{
  assert.match(main,/detail\.type==='calories'\|\|detail\.type==='meal_plan'/);
  assert.match(main,/fizz-open-health-metric','steps'/);
  assert.match(main,/sessionStorage\.getItem\('fizz-open-health-metric'\)/);
});

test('Nutrition editor uses header actions without duplicate footer',()=>{
  assert.match(main,/nutrition-editor-head/);
  assert.match(main,/aria-label="Cancel nutrition changes"/);
  assert.match(main,/aria-label="Save nutrition"/);
  assert.match(css,/grid-template-rows:auto minmax\(0,1fr\)/);
});

test('Restaurant Intelligence has explicit escape paths',()=>{
  assert.match(main,/aria-label="Close restaurants"/);
  assert.match(main,/aria-label="Close restaurant"/);
  assert.match(main,/className="standard-page-head"/);
});

test('Decision explanation pages remain wired to existing detail component',()=>{
  assert.match(main,/title:'LDL Support',decision:ldlDecision/);
  assert.match(main,/title:'Estimated Maintenance',decision:maintenanceDecision/);
  assert.match(main,/title:'Steps',decision:stepsDecision/);
});
