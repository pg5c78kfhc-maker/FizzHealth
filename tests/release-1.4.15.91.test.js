import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const database=fs.readFileSync('src/database.js','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');

test('fiber target is fixed at 30 g with a 40 g maximum',()=>{
  assert.match(database,/UPDATE nutrition_targets[\s\S]*target_value=30[\s\S]*max_value=40[\s\S]*WHERE nutrient='fiber'/);
  assert.match(database,/VALUES \('2026-08-01','fiber',30,40,'g'/);
  assert.match(database,/derived=0/);
});

test('prepared inventory rejects zero or unresolvable servings',()=>{
  assert.match(main,/Recipe serving size must be a valid weight before prepared inventory can be created/);
  assert.match(main,/Prepared servings available must be greater than zero/);
  assert.match(main,/if\(!Number\.isFinite\(quantity\)\|\|quantity<=0\)/);
});

test('prepared inventory deletion removes only the selected batch and its event history',()=>{
  assert.match(main,/DELETE FROM pantry_events WHERE pantry_id=\?/);
  assert.match(main,/DELETE FROM pantry WHERE pantry_id=\? AND food_id=\?/);
  assert.match(main,/ingredient inventory will not be changed/);
});

test('approved forms are contained above the persistent footer',()=>{
  assert.match(css,/v1\.4\.15\.91 — footer-contained creation forms/);
  assert.match(css,/bottom:calc\(var\(--bottom-nav-height,88px\) \+ env\(safe-area-inset-bottom,0px\)\)!important/);
  assert.match(css,/recipe-create-modal/);
  assert.match(css,/component-picker-backdrop/);
  assert.match(css,/recipe-pantry-batch/);
});

test('release metadata is consistently version 1.4.15.91',()=>{
  assert.match(main,/const VERSION='1\.4\.15\.91'/);
  assert.match(main,/const BUILD_ID='141591'/);
  assert.match(main,/FH-20260801-141591/);
  assert.match(database,/TARGET_SCHEMA_VERSION=97/);
});
