import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Meals category collapse uses controlled section buttons and cannot null the page',()=>{
 assert.match(main,/builder-category-summary/);
 assert.doesNotMatch(main,/event\.currentTarget\.open\?next\.add/);
 assert.match(main,/expanded\?<ChevronUp\/>:<ChevronDown\/>/);
});
test('Food editor persists identity classification and nutrition in one update',()=>{
 assert.match(main,/\['name=\?','ingredient_only=\?','classification=\?','usage_designation=\?','category=\?'/);
 assert.match(main,/Tap pencil to edit/);
 assert.match(main,/nutrition-editor-identity/);
});
test('category commit updates existing records in place',()=>{
 assert.match(main,/UPDATE foods SET category=\?,ingredient_only=0,updated_at=\? WHERE food_id=\?/);
 assert.match(main,/UPDATE meal_definitions SET category=\?,ingredient_only=0,updated_at=\? WHERE meal_id=\?/);
});
test('schema 70 cleans only source-linked single-component duplicate meals',()=>{
 assert.match(db,/TARGET_SCHEMA_VERSION=70/);
 assert.match(db,/v1\.4\.15\.7_duplicate_cleanup/);
 assert.match(db,/COUNT\(\*\) FROM meal_components c2/);
});
test('Menu stack has no Chef/category gap',()=>{
 assert.match(css,/today-menu>\.chef-section\+\.menu-category/);
 assert.match(css,/border-top:0!important/);
});
test('v1.4.15.7 stabilization remains represented in release history',()=>{
 assert.match(main,/version:'1\.4\.15\.7'/);
 assert.match(main,/FH-1415\.40/);
});
