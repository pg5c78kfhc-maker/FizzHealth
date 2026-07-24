import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Food and Recipe promotion share one form',()=>{
 assert.match(main,/function PromoteToMealEditor\(\{sourceType,source,onClose,onSaved\}\)/);
 assert.match(main,/sourceType=\{isRecipe\?'recipe':'food'\}/);
 assert.equal((main.match(/<PromoteToMealEditor/g)||[]).length,1);
});

test('promotion requires classified Meal and does not log consumption',()=>{
 assert.match(main,/const MEAL_CATEGORIES=\['Any','Breakfast','Lunch','Dinner','Snack','Appetizer','Side','Dessert','Beverage','Condiment'\]/);
 assert.match(main,/\[category,setCategory\]=useState\('Any'\)/);
 const promotion=main.slice(main.indexOf('function PromoteToMealEditor'),main.indexOf('function FoodRecipeDetails'));
 assert.match(promotion,/insertRecord\(db,'meal_definitions'/);
 assert.match(promotion,/insertRecord\(db,'meal_components'/);
 assert.doesNotMatch(promotion,/insertRecord\(db,'meals'/);
 assert.doesNotMatch(promotion,/insertRecord\(db,'planned_meals'/);
 assert.doesNotMatch(promotion,/autoFocus/);
});

test('Food and Recipe metadata screen has no logging or planning actions',()=>{
 const detail=main.slice(main.indexOf('function FoodRecipeDetails'),main.indexOf('function restaurantDecision'));
 assert.match(detail,/Promote to Meal/);
 assert.doesNotMatch(detail,/Consume now/);
 assert.doesNotMatch(detail,/Plan for later/);
 assert.doesNotMatch(detail,/UniversalLogPanel/);
 assert.doesNotMatch(detail,/>Quantity</);
});

test('Food taps open metadata details instead of the consumption editor',()=>{
 assert.match(main,/onOpen=\{\(\)=>setRecipeDetail\(\{type:'food',\.\.\.f\}\)\}/);
});

test('schema 55 adds Consumption Role with safe default',()=>{
 assert.match(database,/const TARGET_SCHEMA_VERSION=55/);
 assert.match(database,/ALTER TABLE foods ADD COLUMN consumption_role TEXT DEFAULT 'both'/);
});
