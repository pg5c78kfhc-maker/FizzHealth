import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('FH-1236 imported restaurant meals can be edited without a foods-table link',()=>{
  assert.doesNotMatch(main,/The linked food record could not be found/);
  assert.match(main,/Restaurant\/photo imports can be self-contained meal records/);
  assert.match(main,/const n=food\?nutritionFor\(food,qty/);
  assert.match(main,/consumed_local_date=\?/);
});
