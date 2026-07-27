import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Meals category commit uses database categories in AddMeal scope',()=>{
  assert.match(main,/function activeFoodCategoryNames\(\)/);
  assert.match(main,/onSave=\{async selectedCategory=>\{const e=mealCategoryEditor;if\(!e\)return;const chosen=activeFoodCategoryNames\(\)\.includes\(selectedCategory\)/);
  const addMealStart=main.indexOf('function AddMeal(');
  const addMealEnd=main.indexOf('function FoodIntelligencePage',addMealStart);
  const addMeal=main.slice(addMealStart,addMealEnd);
  assert.doesNotMatch(addMeal,/canonicalCategoryNames\.includes/);
});

test('Category picker submits selected value and reports save errors',()=>{
  assert.match(main,/async function commit\(\).*await onSave\(value\)/s);
  assert.match(main,/type="submit" disabled=\{saving\} aria-label="Save category"/);
  assert.match(main,/role="alert"/);
});

test('Menu heading grid keeps count and chevron inside card',()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) max-content 24px!important/);
  assert.match(css,/\.menu-category-heading>span\{[\s\S]*grid-column:auto!important/);
  assert.match(css,/\.chef-section \.menu-category-heading\{grid-template-columns:minmax\(0,1fr\) max-content!important\}/);
});

test('release metadata is v1.4.15.6',()=>{
  assert.match(main,/const VERSION='1\.4\.15\.6'/);
  assert.match(main,/const BUILD_ID='141506'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260727-141506'/);
});
