import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('release identity is v1.4.15.0',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.0'/);
 assert.match(main,/const BUILD_ID='141500'/);
 assert.match(db,/TARGET_SCHEMA_VERSION=68/);
});
test('ingredient only defaults off in schema',()=>assert.match(db,/ingredient_only INTEGER DEFAULT 0/));
test('migration maps component-only records to ingredient only',()=>assert.match(db,/usage_designation,consumption_role,''\)='component' THEN 1/));
test('category controls read active categories from database',()=>assert.match(main,/SELECT display_name FROM food_categories WHERE active=1 ORDER BY sort_order/));
test('old top object-type mode switch is removed from Meals header',()=>{
 const addMeal=main.slice(main.indexOf('function AddMeal'),main.indexOf('function FoodIntelligencePage'));
 assert.match(addMeal,/<h2>Meals<\/h2>/);
 assert.doesNotMatch(addMeal,/library-mode-switch/);
});
test('foods and recipes share unified category groups after legacy Meal migration',()=>{
 assert.match(main,/unified-category-library/);
 assert.match(main,/type:'food'/);
 assert.match(main,/type:'recipe'/);
 assert.match(main,/migrateRemainingLegacyMealsToRecipes/);
});
test('swipe category action is wired for every item type',()=>{
 const addMeal=main.slice(main.indexOf('function AddMeal'),main.indexOf('function FoodIntelligencePage'));
 assert.ok((addMeal.match(/onCategory=\{setCategory\}/g)||[]).length>=2);
});
test('one shared database category picker handles all types',()=>{
 assert.match(main,/function DatabaseCategoryPicker/);
 assert.match(main,/e\.type==='food'/);
 assert.match(main,/e\.type==='recipe'/);
 assert.match(main,/UPDATE meal_definitions SET category=/);
});
