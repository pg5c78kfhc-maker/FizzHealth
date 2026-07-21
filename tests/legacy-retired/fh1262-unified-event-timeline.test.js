import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildUnifiedTimeline} from '../src/experience/intelligence.js';

test('FH-1262 federated timeline includes every supported source without duplicate storage',()=>{
 const sources={
  meals:[{id:7,eaten_at:'2026-07-20T12:00:00Z',food_name:'Recipe lunch',meal_type:'Lunch',calories:620}],
  metrics:[{id:8,measured_at:'2026-07-20T11:00:00Z',metric_type:'blood_pressure',value_primary:120,value_secondary:79,unit:'mmHg'}],
  pantryEvents:[{event_id:9,event_at:'2026-07-20T10:00:00Z',event_type:'inventory_adjusted',notes:'Added two'}],
  healthEvents:[{event_id:10,event_at:'2026-07-20T09:00:00Z',title:'Workout logged',details_json:'{}'}]
 };
 const timeline=buildUnifiedTimeline(sources);
 assert.deepEqual(timeline.map(x=>x.type),['meal','metric','pantry','health']);
 assert.equal(timeline[0].source,sources.meals[0]);
 assert.equal(timeline[0].sourceType,'meal');
});

test('FH-1262 UI records left-delete, right-log-again, undo, and canonical timeline use',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(main,/swipe left removes; swipe right adds\/logs again/);
 assert.match(main,/onQuickAdd=\{quickAddAgain\}/);
 assert.match(main,/const timeline=buildUnifiedTimeline\(\{meals:todayMeals,metrics:/);
 assert.match(main,/deleteTimelineMeal/);
 assert.match(main,/undoTimelineMeal/);
 assert.match(main,/quickAddTimelineMeal/);
});
