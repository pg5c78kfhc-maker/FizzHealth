import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const database=fs.readFileSync('src/database.js','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');
const styles=fs.readFileSync('src/styles.css','utf8');

test('canonical food classifications are stored in SQLite',()=>{
  assert.match(database,/TARGET_SCHEMA_VERSION=67/);
  assert.match(database,/CREATE TABLE IF NOT EXISTS food_categories/);
  assert.match(database,/Canonical food category integrity failure/);
  for(const category of ['Breakfast','Appetizer','Tapas','Soup','Salad','Entrée','Side','Snack','Dessert','Beverage','Alcohol','Condiment'])assert.ok(database.includes(`'${category}'`),`missing ${category}`);
});

test('Menu category picker reads from the database repository',()=>{
  assert.match(main,/SELECT display_name FROM food_categories WHERE active=1 ORDER BY sort_order/);
  assert.doesNotMatch(main,/const canonicalCategoryNames=\[\.\.\.MEAL_CATEGORIES\]/);
  assert.match(main,/No Classification/);
});

test('Menu card calories and protein use a compact stack',()=>{
  assert.match(styles,/v1\.4\.14\.4C — compact calorie\/protein stack/);
  assert.match(styles,/\.white-menu-list \.restaurant-menu-nutrition\{[\s\S]*?gap:2px!important/);
  assert.match(styles,/span\+span\{[\s\S]*?padding-top:3px!important/);
});
