import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('FH-1331 migration 56 keeps only one canonical linked Meal per source',()=>{
  assert.match(database,/target\.rowid=\([\s\S]*SELECT MIN\(candidate\.rowid\)/);
  assert.match(database,/SET source_type=NULL, source_id=NULL[\s\S]*canonical\.rowid < duplicate\.rowid/);
});

test('FH-1331 creates uniqueness only after duplicate recovery',()=>{
  const repair=database.indexOf('SET source_type=NULL, source_id=NULL');
  const unique=database.indexOf('CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_definitions_active_source_unique');
  assert.ok(repair>=0 && unique>repair);
  assert.match(database,/WHERE COALESCE\(archived,0\)=0 AND source_type IS NOT NULL AND source_id IS NOT NULL/);
});

test('FH-1331 preserves duplicate Meal records rather than deleting them',()=>{
  const migration=database.match(/version:56[\s\S]*?version:57/)?.[0]||'';
  assert.doesNotMatch(migration,/DELETE FROM meal_definitions/i);
  assert.match(migration,/Existing duplicate Meal records are preserved/);
});

test('FH-1331 advances schema through an idempotent release marker',()=>{
  assert.match(database,/const TARGET_SCHEMA_VERSION=57/);
  assert.match(database,/version:57,name:'migration_56_duplicate_recovery'/);
  assert.match(database,/VALUES \('1\.4\.11\.33','2026-07-24','141133',57/);
});
