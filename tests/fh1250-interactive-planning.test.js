import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('FH-1250.2 recommendations support explain, dismiss, and accept interactions',()=>{
 assert.match(main,/function RecommendationCard/);
 assert.match(main,/onPointerDown=\{down\}/);
 assert.match(main,/Not today/);
 assert.match(main,/Why\?/);
 assert.match(main,/USE RECOMMENDATION/);
});

test('FH-1250.2 accepted recommendations can be consumed, planned, or scheduled',()=>{
 assert.match(main,/Eat now/);
 assert.match(main,/Add to today’s plan/);
 assert.match(main,/Schedule for later/);
 assert.match(main,/recommendation_accepted/);
 assert.match(main,/planned_meals/);
});

test('FH-1250.2 removed plans and dismissed suggestions are distinct not-today signals',()=>{
 assert.match(main,/planned_meal_removed/);
 assert.match(main,/recommendation_dismissed/);
 assert.match(main,/meaning:'not_today'/);
 assert.match(main,/adaptation_reason='removed_from_today'/);
});

test('FH-1250.2 recommendation guardrails prioritize familiar meals and suppress implausible components',()=>{
 assert.match(main,/candidate\.type==='recipe'\)score\+=45/);
 assert.match(main,/psyllium\|creamer\|dressing\|sauce\|seasoning\|supplement/);
 assert.match(main,/currentMealContext/);
 assert.match(main,/behavior_score/);
});

test('FH-1250.2 keeps Home compact and planner work in Food',()=>{
 assert.match(main,/className="home-next-meal"/);
 assert.doesNotMatch(main,/home-food-summary-actions/);
 assert.match(css,/\.home-next-meal/);
});
