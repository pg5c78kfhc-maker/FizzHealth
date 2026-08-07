import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('program plus opens historical workout picker sorted most recent first',()=>{
  assert.match(main,/type:'history',program/);
  assert.match(main,/ORDER BY ws\.performed_at DESC,ws\.chronological_order DESC/);
  assert.match(main,/most recent first/);
});

test('historical copy deep-copies workout exercises and performed sets without writing history tables',()=>{
  const fn=main.slice(main.indexOf('async function copyHistoricalWorkoutToProgram'),main.indexOf('function HistoricalWorkoutPicker'));
  assert.match(fn,/INSERT INTO program_workouts/);
  assert.match(fn,/FROM workout_session_exercises WHERE session_id=\?/);
  assert.match(fn,/FROM workout_session_sets WHERE session_exercise_id=\?/);
  assert.match(fn,/INSERT INTO workout_exercises/);
  assert.match(fn,/INSERT INTO exercise_sets/);
  assert.doesNotMatch(fn,/UPDATE workout_sessions|DELETE FROM workout_sessions|UPDATE workout_session_exercises|DELETE FROM workout_session_exercises/);
  assert.match(fn,/historicalSet\.rir/);
  assert.match(fn,/historicalSet\.weight/);
});

test('schema 142 preserves source linkage and RIR on editable copies',()=>{
  assert.match(db,/version:142,name:'Historical Workout Planning UI Infrastructure'/);
  for(const column of ['source_session_id','source_performed_at','source_program_name','source_day_label','source_week_number','source_duration_minutes','source_duration_text','source_session_exercise_id','equipment','prescription_text','target_rir','source_line','rir','source_session_set_id']) assert.match(db,new RegExp(`ADD COLUMN ${column}`));
});

test('planned workout removal is swipe-left and confirmed before deleting only the program copy',()=>{
  assert.match(main,/Math\.max\(-92,dx\)/);
  assert.match(main,/window\.confirm\(`Remove \$\{workout\.name\} from this program\?/);
  assert.match(main,/DELETE FROM program_workouts WHERE workout_id=\? AND program_id=\?/);
  assert.match(main,/historical workout will not be changed/);
});

test('historical picker previews exercise sets, reps, weight and RIR inside viewport-safe UI',()=>{
  assert.match(main,/historical-preview-sets/);
  assert.match(main,/setItem\.weight!=null/);
  assert.match(main,/setItem\.rir!=null/);
  assert.match(css,/historical-workout-picker-body\{[^}]*overflow-x:hidden/);
  assert.match(css,/historical-workout-card\{[^}]*max-width:100%/);
});
