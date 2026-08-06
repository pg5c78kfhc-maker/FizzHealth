import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('programs and workouts render as nested collapsible cards',()=>{
 assert.match(main,/expandedPrograms/);
 assert.match(main,/expandedWorkouts/);
 assert.match(main,/nested-workout-list/);
 assert.match(main,/nested-exercise-list/);
 assert.match(main,/aria-expanded=\{open\}/);
 assert.doesNotMatch(main,/function ProgramWorkoutsPage/);
});

test('pencil edits metadata and plus adds child records',()=>{
 assert.match(main,/Edit \$\{program\.name\}/);
 assert.match(main,/Add workout to \$\{program\.name\}/);
 assert.match(main,/Edit \$\{workout\.name\}/);
 assert.match(main,/Add exercise to \$\{workout\.name\}/);
});

test('exercise persistence migration is versioned and relational',()=>{
 assert.match(db,/const TARGET_SCHEMA_VERSION=139/);
 assert.match(db,/version:139,name:'Nested Workout Hierarchy and Exercises Foundation'/);
 assert.match(db,/CREATE TABLE IF NOT EXISTS workout_exercises/);
 assert.match(db,/FOREIGN KEY\(workout_id\) REFERENCES program_workouts\(workout_id\) ON DELETE CASCADE/);
 assert.match(db,/idx_workout_exercises_workout_order/);
});

test('exercise editor captures name, sets, reps, and notes',()=>{
 assert.match(main,/function ExerciseEditor/);
 assert.match(main,/Exercise name/);
 assert.match(main,/>Sets</);
 assert.match(main,/>Reps</);
 assert.match(main,/INSERT INTO workout_exercises/);
});

test('workout editors are constrained to the visual viewport',()=>{
 assert.match(css,/\.workout-editor-page\{position:fixed/);
 assert.match(css,/height:var\(--visual-viewport-height,100dvh\)/);
 assert.match(css,/max-width:100vw/);
 assert.match(css,/overflow-x:hidden/);
 assert.match(css,/scroll-padding-block:24px 45vh/);
 assert.match(css,/font-size:16px/);
});
