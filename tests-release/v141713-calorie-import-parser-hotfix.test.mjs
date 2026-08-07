import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWorkoutCalorieResponseText,parseWorkoutCalorieResponse} from '../src/workout/calorieExchange.js';

const executionId='execution-1786115097434-jyndsme';
const base={schema_version:1,exchange_type:'fizz_health_workout_calorie_estimate_response',workout_execution_id:executionId,estimated_calories:285,estimated_calories_low:220,estimated_calories_high:360,methodology:'Resistance training estimate',notes:'Test'};

test('parses strict JSON response',()=>{
 const parsed=parseWorkoutCalorieResponse(JSON.stringify(base),executionId);
 assert.equal(parsed.estimated_calories,285);
});

test('accepts fenced JSON surrounded by prose',()=>{
 const raw=`Here is the requested response:\n\n\`\`\`json\n${JSON.stringify(base,null,2)}\n\`\`\`\n`;
 const parsed=parseWorkoutCalorieResponse(raw,executionId);
 assert.equal(parsed.estimated_calories_low,220);
});

test('normalizes smart quote JSON copied from rich text',()=>{
 const raw=`{\n  “schema_version”: 1,\n  “exchange_type”: “fizz_health_workout_calorie_estimate_response”,\n  “workout_execution_id”: “${executionId}”,\n  “estimated_calories”: 285,\n  “methodology”: “Estimated from the recorded 48.9-minute session”,\n  “notes”: “One value appears anomalous.”\n}`;
 const parsed=parseWorkoutCalorieResponse(raw,executionId);
 assert.equal(parsed.estimated_calories,285);
 assert.equal(parsed.notes,'One value appears anomalous.');
});

test('preserves embedded smart quoted phrases inside string values',()=>{
 const raw=`{“schema_version”:1,“exchange_type”:“fizz_health_workout_calorie_estimate_response”,“workout_execution_id”:“${executionId}”,“estimated_calories”:285,“notes”:“Treated “1565 reps” as anomalous.”}`;
 const normalized=normalizeWorkoutCalorieResponseText(raw);
 const parsed=parseWorkoutCalorieResponse(raw,executionId);
 assert.match(normalized,/\\"1565 reps\\"/);
 assert.equal(parsed.notes,'Treated "1565 reps" as anomalous.');
});

test('still rejects a response for another workout',()=>{
 assert.throws(()=>parseWorkoutCalorieResponse(JSON.stringify({...base,workout_execution_id:'other'}),executionId),/different workout/);
});
