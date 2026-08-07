import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('schema 143 persists active program selection, progression configuration and performed sets',()=>{
 assert.match(db,/version:143,name:'Active Program Execution and Progressive Overload'/);
 for(const column of ['active_started_at','active_ends_at','selected_workout_id','selected_exercise_id','weight_unit','increase_by','stable_workouts','fourth_set_target','stable_streak','current_weight','progression_pending']) assert.match(db,new RegExp(`ADD COLUMN ${column}`));
 assert.match(db,/CREATE TABLE IF NOT EXISTS workout_execution_sessions/);
 assert.match(db,/CREATE TABLE IF NOT EXISTS workout_execution_sets/);
 assert.match(db,/const TARGET_SCHEMA_VERSION=143/);
});

test('program activation enforces a single active program and routine selection is persisted',()=>{
 assert.match(main,/async function activateWorkoutProgram/);
 assert.match(main,/WHERE status='Active' AND program_id<>\?/);
 assert.match(main,/UPDATE workout_programs SET status='Planned'/);
 assert.match(main,/UPDATE workout_programs SET status='Active'/);
 assert.match(main,/selected_workout_id=\?,selected_exercise_id=NULL/);
 assert.match(main,/program-run-button/);
});

test('routine exercise management uses library selection and persistent reorder controls',()=>{
 assert.match(main,/function ExerciseLibraryPicker/);
 assert.match(main,/SELECT \* FROM exercise_library ORDER BY name COLLATE NOCASE/);
 assert.match(main,/function ExerciseReorderPage/);
 assert.match(main,/UPDATE workout_exercises SET display_order=\?,updated_at=\?/);
 assert.match(main,/GripVertical/);
 assert.match(main,/ArrowUpDown/);
 assert.match(main,/Replace from Exercise Library/);
 assert.match(main,/DELETE FROM workout_exercises WHERE exercise_id=\?/);
});

test('set execution keeps historical values as reference and stores new performed results separately',()=>{
 assert.match(main,/function PerformedSetEditor/);
 assert.match(main,/Background values show your previous comparable set/);
 assert.match(main,/placeholder=\{prior\?\.reps/);
 assert.match(main,/INSERT OR REPLACE INTO workout_execution_sets/);
 const performed=main.slice(main.indexOf('function PerformedSetEditor'),main.indexOf('function FoodHub'));
 assert.doesNotMatch(performed,/UPDATE workout_session_sets|DELETE FROM workout_session_sets/);
 assert.match(main,/performed-set-primary-row/);
 assert.match(css,/\.performed-set-primary-row\{display:grid;grid-template-columns:repeat\(3/);
});

test('progressive overload uses fourth set target, stable workouts, increase by and one-time marker',()=>{
 assert.match(main,/Number\(templateSet\.set_number\)===4&&exercise\.fourth_set_target/);
 assert.match(main,/nextStreak>=needed/);
 assert.match(main,/nextWeight=base\+Number\(exercise\.increase_by\|\|0\)/);
 assert.match(main,/progression_pending=1/);
 assert.match(main,/autoMarker=Number\(exercise\.progression_pending\|\|0\)===1&&Number\(templateSet\.set_number\)===1/);
 assert.match(main,/progression_pending=0/);
 assert.match(main,/auto-weight-arrow/);
});
