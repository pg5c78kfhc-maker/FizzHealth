import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('Meals library is a secondary screen with an explicit return to Food',()=>{
  assert.match(main,/function AddMeal\(\{refresh,done,onBack/);
  assert.match(main,/aria-label="Close Meals and return to Food"/);
  assert.match(main,/onBack=\{\(\)=>visit\('food'\)\}/);
});

test('recipe edit and universal logging controls are explicitly wired',()=>{
  assert.match(main,/aria-label="Edit recipe"/);
  assert.match(main,/setEditing\(true\)/);
  assert.match(main,/setLogStatus\('planned'\)/);
  assert.match(main,/setLogStatus\('consumed'\)/);
  assert.match(main,/universal-log-backdrop/);
});

test('nested editors render above recipe detail',()=>{
  assert.match(css,/recipe-create-modal,.universal-log-backdrop,.component-picker-backdrop\{z-index:3200!important\}/);
});

test('About uses centralized current release metadata',()=>{
  assert.equal(meta.version,'1.4.11.17');
  assert.equal(meta.build,'141317');
  assert.equal(meta.release_id,'FH-20260723-141317');
  assert.match(main,/Application version<\/span><b>\{VERSION\}/);
  assert.match(main,/Build identifier<\/span><b>\{BUILD_ID\}/);
  assert.match(main,/Deployment<\/span><b>\{DEPLOYMENT_ID\}/);
});
