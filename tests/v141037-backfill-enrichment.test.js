import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('enrichment approval persists non-null request and response JSON',()=>{
  assert.match(source,/JSON\.stringify\(request\),JSON\.stringify\(preview\),JSON\.stringify\(proposed\)/);
  assert.doesNotMatch(source,/\['approved',null,null,JSON\.stringify\(proposed\)/);
});

test('enrichment approval exposes immediate saving state outside scroll region',()=>{
  assert.match(source,/setMessage\('Saving changes…'\);setBusy\(true\)/);
  assert.match(source,/role="status" aria-live="assertive"/);
  assert.match(source,/type="button" className="header-icon-action save-action" onClick=\{apply\}/);
});

test('current recipe meals are backfilled once with all registered nutrients',()=>{
  assert.match(source,/async function backfillCurrentRecipeMealsOnce\(\)/);
  assert.match(source,/recipe_nutrient_backfill_141037/);
  assert.match(source,/for\(const key of NUTRIENT_KEYS\)if\(cols\.has\(key\)\)/);
  assert.match(source,/food_id LIKE 'recipe:%'/);
  assert.match(source,/INSERT OR REPLACE INTO settings\(key,value\)/);
});

test('backfill runs before application becomes ready',()=>{
  assert.match(source,/then\(async\(\)=>\{await backfillCurrentRecipeMealsOnce\(\);setReady\(true\)\}\)/);
});
