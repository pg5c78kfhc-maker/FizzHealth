import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateMaintenanceEstimate,evaluateMaintenance} from '../src/decision/engine.js';

const main=fs.readFileSync(new URL('../src/main.jsx', import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css', import.meta.url),'utf8');

test('release metadata is v1.4.17.17',()=>{
  assert.match(main,/const VERSION='1\.4\.17\.17'/);
});

test('completed workout exchange is a compact icon inside the workout action row',()=>{
  assert.match(main,/nested-card-actions \$\{finishedExecution\?'four':'three'\}/);
  assert.match(main,/className="workout-exchange-icon"[^>]+aria-label={`Export \$\{workout\.name\} for calorie estimate`}/);
  assert.match(main,/className="workout-exchange-icon"[^>]+aria-label={`Import calorie estimate for \$\{workout\.name\}`}/);
  assert.doesNotMatch(main,/finishedExecution&&<div className="workout-exchange-actions"/);
});

test('four-icon row reserves only title-row footprint and leaves metadata full width',()=>{
  assert.match(css,/\.nested-card-actions\.four\{[\s\S]*grid-template-columns:repeat\(4,34px\)/);
  assert.match(css,/\.nested-workout-card:has\(\.nested-card-actions\.four\) \.nested-workout-toggle>div>b\{[\s\S]*padding-right:154px/);
  assert.doesNotMatch(css,/\.nested-workout-card:has\(\.nested-card-actions\.four\) \.nested-workout-toggle>div\{[^}]*padding-right/);
});

test('maintenance estimate consumes workout calorie context without adding it twice',()=>{
  const weights=[
    {local_date:'2026-07-01',value_primary:230},
    {local_date:'2026-07-05',value_primary:229.5},
    {local_date:'2026-07-10',value_primary:229},
    {local_date:'2026-07-15',value_primary:228.5},
    {local_date:'2026-07-20',value_primary:228}
  ];
  const mealDays=Array.from({length:20},(_,i)=>({local_date:`2026-07-${String(i+1).padStart(2,'0')}`,calories:2000}));
  const stepDays=Array.from({length:20},(_,i)=>({local_date:`2026-07-${String(i+1).padStart(2,'0')}`,steps:8000}));
  const base=calculateMaintenanceEstimate({weights,mealDays,stepDays});
  const withWorkouts=calculateMaintenanceEstimate({weights,mealDays,stepDays,workoutDays:[
    {local_date:'2026-07-05',estimated_calories:300},
    {local_date:'2026-07-10',estimated_calories:250},
    {local_date:'2026-07-15',estimated_calories:350}
  ]});
  assert.equal(withWorkouts.estimate,base.estimate,'weight trend already contains workout expenditure, so center estimate must not double-count it');
  assert.ok(withWorkouts.workoutEstimateDays>0);
  assert.ok(withWorkouts.workoutCaloriesAverage>0);
  assert.ok(withWorkouts.backgroundMaintenance<withWorkouts.estimate);
  assert.ok(withWorkouts.confidence>=base.confidence);
});

test('maintenance decision trace explains workout context and lower-confidence treatment',()=>{
  const trace=evaluateMaintenance({estimate:2400,lower:2250,upper:2550,confidence:76,days:20,averageCalories:2200,weightChange:-1.1,stepsAverage:8000,workoutEstimateDays:4,workoutCaloriesAverage:80,backgroundMaintenance:2320});
  assert.equal(trace.inputs.workout_estimate_days,4);
  assert.equal(trace.inputs.average_workout_calories,80);
  assert.ok(trace.dataUsed.includes('Recorded workout calorie estimates'));
  assert.match(trace.methodology,/not simply added/i);
});
