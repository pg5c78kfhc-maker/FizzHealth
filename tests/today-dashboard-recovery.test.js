import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Today command center treats secondary feature tables as optional',()=>{
  assert.match(main,/optionalQuery=.*try.*query/s);
  assert.match(main,/pendingCaptures=optionalQuery/);
  assert.match(main,/preventiveItems=optionalQuery/);
});

test('startup repairs feature schemas even when migrations were already recorded',()=>{
  assert.match(db,/function repairFeatureSchema/);
  assert.match(db,/version>=34/);
  assert.match(db,/repairFeatureSchema\(\);reconcileImportSchema/);
});


test('meal planner reads weight from canonical health_metrics columns',()=>{
  assert.match(main,/SELECT value_primary FROM health_metrics WHERE metric_type='weight'/);
  assert.doesNotMatch(main,/SELECT weight FROM health_metrics WHERE weight IS NOT NULL/);
  assert.doesNotMatch(main,/ORDER BY recorded_at DESC/);
});

test('secondary recommendation and planning widgets cannot crash Today',()=>{
  assert.match(main,/ErrorBoundary label="Chef’s Recommendations"/);
  assert.match(main,/ErrorBoundary label="Meal planner"/);
});
