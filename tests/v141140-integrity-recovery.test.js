import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('current release metadata remains centralized after v1.4.11.40 recovery',()=>{
  assert.equal(pkg.version,meta.version);
  assert.match(main,new RegExp(`const VERSION='${meta.version.replaceAll('.', '\\.')}'`));
  assert.match(db,new RegExp(`TARGET_SCHEMA_VERSION=${meta.schema_version}`));
});

test('approved Food Library redesign is active and old action row is absent',()=>{
  assert.match(main,/library-mode-switch/);
  assert.match(main,/\[\['ingredients',Apple,'Ingredients'\],\['recipes',BookOpen,'Recipes'\],\['meals',UtensilsCrossed,'Meals'\]\]/);
  assert.match(main,/className="create-menu"/);
  assert.match(main,/New Ingredient/);
  assert.match(main,/New Recipe/);
  assert.match(main,/New Meal/);
  assert.doesNotMatch(main,/compact-library-actions/);
});

test('classification and usage remain available across object editors',()=>{
  assert.match(main,/const CLASSIFICATIONS=/);
  assert.match(main,/classification-controls/);
  assert.match(main,/UPDATE foods SET classification/);
  assert.match(main,/UPDATE recipes SET \$\{field\}/);
  assert.match(main,/UPDATE meal_definitions SET \$\{field\}/);
});

test('planner and builders use standalone and component capability',()=>{
  assert.match(main,/usage_designation,consumption_role,'component'/);
  assert.match(main,/IN \('standalone','both'\)/);
  assert.match(main,/IN \('component','both'\)/);
});

test('build lifecycle repairs duplicate project trees before dev and build',()=>{
  assert.equal(pkg.scripts.predev,'npm run integrity:repair');
  assert.equal(pkg.scripts.prebuild,'npm run integrity:repair');
  assert.equal(pkg.scripts.pretest,'npm run integrity:check');
});
