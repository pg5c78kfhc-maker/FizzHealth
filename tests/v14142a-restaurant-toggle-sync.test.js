import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('corrective release metadata is current',()=>{
 assert.equal(version.version,'1.4.14.2B');
 assert.equal(version.build,'141402B');
 assert.equal(version.release_id,'FH-20260726-141402B');
 assert.equal(version.completed_story,'FH-1414.2B');
});

test('restaurant preference uses one shared atomic synchronization function',()=>{
 assert.match(main,/async function updateRestaurantDayPreference\(date,next\)/);
 assert.match(main,/INSERT OR REPLACE INTO daily_preferences/);
 assert.match(main,/source_type:'reservation'/);
 assert.match(main,/reserved_calories:800/);
 assert.match(main,/adaptation_reason='restaurant_day_cancelled'/);
});

test('turning Restaurant Day off blocks only actual restaurant meals',()=>{
 assert.match(main,/actualPlanned=db\.query\(`SELECT id FROM planned_meals[^`]+source_type='restaurant'/s);
 assert.match(main,/actualConsumed=db\.query\(`SELECT id FROM meals/);
 assert.match(main,/if\(!next&&\(actualPlanned\|\|actualConsumed\)\)throw new Error/);
 assert.doesNotMatch(main,/if\(!next&&restaurantMealExists\).*setRestaurantDay\(true\)/s);
});

test('Food Log toggle immediately creates or removes the reservation and refreshes projections',()=>{
 const start=main.indexOf('async function setRestaurantDayPreference(next)');
 const end=main.indexOf('\n }\n\n return <div ref={viewRef}',start)+3;
 const block=main.slice(start,end);
 assert.match(block,/await updateRestaurantDayPreference\(selectedDate,next\)/);
 assert.match(block,/setRevision\(x=>x\+1\)/);
 assert.match(block,/setRedrawKey\(x=>x\+1\)/);
 assert.match(block,/setRestaurantDay\(next\)/);
});

test('Menu toggle refreshes planner rows immediately',()=>{
 const start=main.indexOf('async function setRestaurantPreference(next)');
 const end=main.indexOf('\n async function removeRow',start);
 const block=main.slice(start,end);
 assert.match(block,/await updateRestaurantDayPreference\(selectedDate,next\)/);
 assert.match(block,/setRevision\(x=>x\+1\)/);
 assert.match(main,/disabled=\{restaurantUpdating\}/);
});

test('toggle thumb has definitive left and right resting positions',()=>{
 assert.match(styles,/\.restaurant-day-control button i\{position:absolute;left:3px;top:3px/);
 assert.match(styles,/\.restaurant-day-control\.yes button i\{left:28px;background:#9be64d\}/);
 assert.doesNotMatch(styles,/\.restaurant-day-control\.yes button i\{transform:translateX\(24px\)/);
});

test('Restaurant Day switch handler closes the JSX expression before rendering children',()=>{
 assert.match(main,/onClick=\{async\(\)=>\{try\{await setRestaurantPreference\(!restaurantDay\)\}catch\(e\)\{window\.alert\(e\.message\)\}\}\}><i\/>/);
});
