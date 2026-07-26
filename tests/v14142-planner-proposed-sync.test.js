import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isRestaurantReservation,plannerCalendarHasItems,plannedLifecycleState} from '../src/planning/synchronization.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release identity and sprint stories are current',()=>{
 assert.equal(version.version,'1.4.14.2A');
 assert.equal(version.build,'141402A');
 assert.equal(version.release_id,'FH-20260726-141402A');
 assert.deepEqual(version.stories,['FH-1414.2A-01','FH-1414.2A-02','FH-1414.2A-03']);
});

test('planned lifecycle is a single proposed state until consumption',()=>{
 assert.equal(plannedLifecycleState({status:'planned',source_type:'food'}),'proposed');
 assert.equal(plannedLifecycleState({status:'consumed',source_type:'food'}),'consumed');
 assert.match(main,/UPDATE planned_meals SET status='consumed',consumed_at=/);
 assert.match(main,/source_record_id:`planned-\$\{row\.id\}`/);
 assert.match(main,/meal_type:row\.meal_type/);
});

test('restaurant reservations are projected placeholders, not consumable meals',()=>{
 assert.equal(isRestaurantReservation({source_type:'reservation'}),true);
 assert.equal(plannedLifecycleState({source_type:'reservation',status:'planned'}),'reservation');
 assert.match(main,/Restaurant meal — undecided/);
 assert.match(main,/reserved_calories:800/);
 assert.match(main,/Choose the actual restaurant meal before consuming this reservation/);
 assert.match(main,/status='replaced'/);
});

test('restaurant preference reconciles on page open and blocks contradictory off state',()=>{
 assert.match(main,/reconcileRestaurantPlanDate\(selectedDate\)/);
 assert.match(main,/Restaurant Day cannot be turned off after a restaurant meal is planned or consumed/);
 assert.match(main,/SELECT id FROM meals WHERE consumed_local_date=\?/);
});

test('calendar indicator derives only from current planned rows',()=>{
 assert.equal(plannerCalendarHasItems([]),false);
 assert.equal(plannerCalendarHasItems([{status:'cancelled'}]),false);
 assert.equal(plannerCalendarHasItems([{status:'planned'}]),true);
 assert.match(main,/plannerCalendarHasItems\(rows\).*calendar-meal-indicator/);
});

test('saving no destinations removes existing planner assignments',()=>{
 const save=main.slice(main.indexOf('async function saveAddToMeals()'),main.indexOf('const addFromMenu='));
 assert.doesNotMatch(save,/!picker\.selected\.length/);
 assert.match(save,/status='cancelled'/);
 assert.match(save,/removed from the plan/);
});
