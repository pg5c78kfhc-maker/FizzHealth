import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');

test('recipe duplicate validation uses canonical IDs with normalized-name fallback',()=>{
  assert.match(main,/const canonicalIngredientIdentity=row=>/);
  assert.match(main,/return name\?`name:\$\{name\}`:''/);
  assert.doesNotMatch(main,/new Set\(ingredients\.map\(row=>String\(row\.food_id\)\)\)/);
});

test('missing legacy IDs are not collapsed into one undefined duplicate',()=>{
  assert.match(main,/id&&id!=='undefined'&&id!=='null'/);
  assert.match(main,/const duplicateIngredient=ingredients\.find/);
  assert.match(main,/duplicateIngredient\.food\?\.name/);
});

test('release metadata identifies the blocking corrective build',()=>{
  assert.match(main,/const VERSION='1\.4\.11\.9'/);
  assert.match(main,/const BUILD_ID='141190'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260723-141190'/);
});
