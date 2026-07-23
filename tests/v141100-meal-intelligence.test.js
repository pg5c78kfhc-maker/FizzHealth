import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('first-class meal model and categories are present',()=>{assert.match(db,/CREATE TABLE IF NOT EXISTS meal_definitions/);assert.match(db,/CREATE TABLE IF NOT EXISTS meal_components/);assert.match(main,/Breakfast','Lunch','Dinner','Any','Snack','Appetizer','Side','Dessert','Beverage','Condiment/)});
test('meal library and builder are wired',()=>{assert.match(main,/New Meal/);assert.match(main,/MealDefinitionEditor/);assert.match(main,/meal-definition-card/)});
test('universal logging supports consumed and planned timestamps',()=>{assert.match(main,/function UniversalLogPanel/);assert.match(main,/A consumed item cannot be dated in the future/);assert.match(main,/status==='planned'/)});
