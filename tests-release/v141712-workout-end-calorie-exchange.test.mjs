import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('workout starts on first committed set, not routine selection',()=>{assert.match(main,/let activeExecution=execution;if\(!activeExecution\|\|activeExecution\.status!=='active'\)activeExecution=await ensureWorkoutExecution/);assert.doesNotMatch(main,/routine-select-check/)});
test('completed workout uses completion-only checkmark and supports early end',()=>{assert.match(main,/routine-complete-mark/);assert.match(main,/async function endWorkoutEarly/);assert.match(main,/status='ended_early'/)});
test('calorie estimate exchange is versioned and bound to execution id',()=>{assert.match(main,/fizz_health_workout_calorie_estimate_request/);assert.match(main,/fizz_health_workout_calorie_estimate_response/);assert.match(main,/workout_execution_id/);assert.match(main,/estimated_calories/)});
test('schema 146 persists end and calorie estimate metadata',()=>{assert.match(db,/TARGET_SCHEMA_VERSION=146/);assert.match(db,/version:146/);for(const col of ['end_reason','estimated_calories','calorie_estimate_json','calorie_exported_at'])assert.match(db,new RegExp(col))});
