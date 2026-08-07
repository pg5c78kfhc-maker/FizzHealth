import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const db=fs.readFileSync('src/database.js','utf8');
const seed=fs.readFileSync('src/workouts/historyImportSql.js','utf8');
test('schema 141 creates workout history and exercise library tables',()=>{
  assert.match(db,/TARGET_SCHEMA_VERSION=141/);
  assert.match(db,/version:141,name:'Workout History and Exercise Library Import'/);
  for(const table of ['exercise_library','workout_sessions','workout_session_exercises','workout_session_sets','workout_history_import_audit']) assert.match(db,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
});
test('historical seed contains exact validated source counts',()=>{
  assert.equal((seed.match(/INSERT OR IGNORE INTO workout_sessions\(/g)||[]).length,138);
  assert.equal((seed.match(/INSERT OR IGNORE INTO workout_session_exercises\(/g)||[]).length,786);
  assert.equal((seed.match(/INSERT OR IGNORE INTO workout_session_sets\(/g)||[]).length,2848);
  assert.match(seed,/VALUES \('workouts-2026-07-29','2026_07_29 Workouts\.pdf',138,786,2848,41/);
});
test('history is seeded oldest to newest and retains weight reps and RIR',()=>{
  assert.match(seed,/2025-07-19T19:27:00/);
  assert.match(seed,/2026-07-15T11:00:00/);
  assert.match(seed,/workout_session_sets\(session_set_id,session_exercise_id,set_number,weight,weight_unit,reps,rir/);
  assert.match(seed,/source_exercise_name,source_equipment,target_reps,target_rir,prescription_text/);
});
test('exercise library retains reusable canonical definitions while source labels remain on occurrences',()=>{
  assert.match(seed,/Butterfly with Wide Grip/);
  assert.match(seed,/Butter y with Wide Grip/);
  assert.match(db,/exercise_definition_id TEXT NOT NULL/);
});
