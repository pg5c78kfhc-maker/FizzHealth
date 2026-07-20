import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('FH-1220 schema and importer coverage are present',()=>{
  const db=fs.readFileSync('src/database.js','utf8');
  const importer=fs.readFileSync('src/importer.js','utf8');
  assert.match(db,/TARGET_SCHEMA_VERSION=43/);
  for(const table of ['workout_sessions','workout_sets','sleep_daily','health_context_entries','workbook_import_coverage'])assert.match(db,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  for(const sheet of ['Body Metrics','Daily Activity','Lab Results','Workout Sessions','Workout Sets','Health Targets','Health Context','Sleep Daily'])assert.ok(importer.includes(sheet),`${sheet} import missing`);
  assert.match(importer,/DELETE FROM health_metrics WHERE source='workbook'/);
  assert.match(importer,/workbook_import_coverage/);
});

test('release metadata preserves schema 43 in v1.4.10.16',()=>{
  const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));
  assert.equal(meta.version,'1.4.10.16');assert.equal(meta.schema_version,43);assert.ok(meta.stories.includes('FH-1227'));
});
