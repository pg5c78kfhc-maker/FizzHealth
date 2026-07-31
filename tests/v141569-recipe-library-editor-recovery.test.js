import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('remaining legacy meals are migrated into canonical recipes and historical links are preserved',()=>{
 assert.match(main,/async function migrateRemainingLegacyMealsToRecipes/);
 assert.match(main,/UPDATE planned_meals SET meal_definition_id=/);
 assert.match(main,/UPDATE meals SET meal_definition_id=/);
 assert.match(main,/DELETE FROM meal_definitions WHERE meal_id=/);
});

test('recipe content picker supports grams and current recipe terminology',()=>{
 assert.match(main,/function ingredientUnitOptions/);
 assert.match(main,/foodQuantityToGrams/);
 assert.match(main,/<small>RECIPE CONTENTS<\/small>/);
 assert.doesNotMatch(main,/<small>\{mode==='meal'\?'MEAL CONTENTS'/);
});

test('recipe content picker is keyboard-safe and scrollable without clipped nutrition',()=>{
 assert.match(css,/v1\.4\.15\.69 — Recipe editor keyboard, scrolling, and clipping corrective/);
 assert.match(css,/\.component-picker-body\{[^}]*overflow-y:auto!important/);
 assert.match(css,/scroll-padding-bottom:140px/);
 assert.match(css,/\.nutrition-preview\.compact\{[^}]*overflow:visible!important/);
});

test('library exposes recipe availability, sorts available first, and excludes legacy meal cards',()=>{
 assert.match(main,/const recipeLibraryAvailability=/);
 assert.match(main,/Number\(libraryEntryAvailable\(b\)\)-Number\(libraryEntryAvailable\(a\)\)/);
 assert.match(main,/ingredients unavailable/);
 assert.match(main,/const items=\[\.\.\.foods\.map[\s\S]*\.\.\.recipes\.map/);
 assert.doesNotMatch(main,/const items=\[[^;]*\.\.\.mealDefs\.map/);
});

test('Ingredient is a first-class category and release metadata is current',()=>{
 assert.match(main,/Array\.from\(new Set\(\['Ingredient'/);
 assert.match(main,/const ingredient=chosen==='Ingredient'/);
 assert.match(main,/version:'1\.4\.15\.69'/);
 assert.match(db,/VALUES \('1\.4\.15\.69','2026-07-30','141569',95/);
});
