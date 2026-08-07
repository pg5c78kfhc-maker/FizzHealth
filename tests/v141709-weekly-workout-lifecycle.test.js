import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('schema 144 adds weekly execution, durations and persisted rest timers',()=>{
 assert.match(db,/version:144,name:'Weekly Workout Execution, Rest Timing and Health Timeline'/);
 for(const column of ['current_week','completed_at','terminated_at','rest_between_exercises_seconds','rest_between_sets_seconds','week_number','duration_minutes']) assert.match(db,new RegExp(`ADD COLUMN ${column}`));
 assert.match(db,/CREATE TABLE IF NOT EXISTS workout_rest_timers/);
 assert.match(db,/const TARGET_SCHEMA_VERSION=144/);
});

test('routine selection starts a week-scoped execution and completed routines cannot be selected again that week',()=>{
 assert.match(main,/ensureWorkoutExecution\(program,workout\)/);
 assert.match(main,/week_number=\? AND status='completed'/);
 assert.match(main,/INSERT INTO workout_execution_sessions\(execution_id,program_id,workout_id,started_at,status,week_number\)/);
 assert.match(main,/if\(already\)return/);
});

test('final set completes workout, records duration and advances or completes program',()=>{
 assert.match(main,/completeWorkoutExecutionIfReady/);
 assert.match(main,/duration=Math\.max\(0,\(endMs-startMs\)\/60000\)/);
 assert.match(main,/SET status='completed',completed_at=\?,duration_minutes=\?/);
 assert.match(main,/completedCount>=workoutCount/);
 assert.match(main,/SET current_week=\?/);
 assert.match(main,/SET status='Completed',completed_at=\?/);
 assert.match(main,/Completed \{new Date\(c\.completed_at\)/);
});

test('rest timing is configurable and rendered as draining progress bars',()=>{
 assert.match(main,/Rest Between Exercises \(seconds\)/);
 assert.match(main,/Rest Between Sets \(seconds\)/);
 assert.match(main,/startWorkoutRestTimer\(execution\.execution_id,'set'/);
 assert.match(main,/startWorkoutRestTimer\(execution\.execution_id,'exercise'/);
 assert.match(main,/function RestCountdownBar/);
 assert.match(css,/\.workout-rest-progress/);
 assert.match(css,/\.workout-rest-track i/);
});

test('completed workouts join the Health and meal timeline without mutating imported history',()=>{
 assert.match(main,/const workoutTimeline=optionalQuery/);
 assert.match(main,/JOIN program_workouts pw ON pw\.workout_id=wx\.workout_id/);
 assert.match(main,/type:'workout'/);
 assert.match(css,/timeline-dot\.workout/);
 const lifecycle=main.slice(main.indexOf('function workoutExpectedSetCount'),main.indexOf('function FoodHub'));
 assert.doesNotMatch(lifecycle,/UPDATE workout_sessions|DELETE FROM workout_sessions|UPDATE workout_session_sets|DELETE FROM workout_session_sets/);
});
