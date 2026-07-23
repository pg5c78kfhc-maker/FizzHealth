import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('FH-1250.1 relocates full planner and recommendations to Food',()=>{
 assert.match(main,/id:'food-planner'.*title:'Plan a meal'/s);
 assert.match(main,/id:'food-recommendations'.*title:'Recommendations'/s);
 assert.match(main,/function FoodPlannerPage/);
 assert.match(main,/function FoodRecommendationsPage/);
 assert.match(main,/tab==='food-planner'/);
 assert.match(main,/tab==='food-recommendations'/);
});

test('FH-1250.1 keeps Home focused on daily state while planning remains in Food',()=>{
 const todayStart=main.indexOf('function Today(');
 const plannerStart=main.indexOf('function ForwardMealPlanner');
 const todaySource=main.slice(todayStart,plannerStart);
 assert.match(todaySource,/Today’s meals/);
 assert.doesNotMatch(todaySource,/HomeFoodPlanningSummary/);
 assert.match(todaySource,/decision-intelligence-disclosure/);
 assert.doesNotMatch(todaySource,/<ForwardMealPlanner/);
 assert.doesNotMatch(todaySource,/<ChefRecommendations/);
 assert.match(css,/\.decision-intelligence-disclosure/);
});

test('FH-1250.1 planner fails soft and supports retry and empty states',()=>{
 assert.match(main,/FH-1250 meal planner calculation failed/);
 assert.match(main,/Meal planner could not load/);
 assert.match(main,/setRetryKey\(x=>x\+1\)/);
 assert.match(main,/No qualifying foods yet/);
 assert.match(main,/optionalQuery\(`SELECT p\.pantry_id/);
 assert.match(main,/Number\.isFinite/);
});

test('FH-1250.1 Food pages preserve explicit escape paths',()=>{
 assert.match(main,/PageShell eyebrow="FOOD" title="Meal Planner"[^>]*onBack=/);
 assert.match(main,/PageShell eyebrow="FOOD" title="Chef’s Recommendations"[^>]*onBack=/);
 assert.match(main,/PageShell eyebrow="FOOD" title="Upcoming Meals"[^>]*onBack=/);
 assert.match(main,/className="back-link" onClick=\{onBack\}>‹ Back/);
});
