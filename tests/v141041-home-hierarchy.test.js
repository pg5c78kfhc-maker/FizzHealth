import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('v1.4.10.41 removes the Next Meal Home panel',()=>{
 assert.doesNotMatch(main,/function HomeFoodPlanningSummary/);
 assert.doesNotMatch(main,/home-next-meal/);
});

test('v1.4.10.41 adds a collapsed-by-default Decision Intelligence disclosure',()=>{
 assert.match(main,/showDecisionIntelligence,setShowDecisionIntelligence\]=useState\(false\)/);
 assert.match(main,/className=\{`decision-intelligence-disclosure/);
 assert.match(main,/aria-expanded=\{showDecisionIntelligence\}/);
 assert.match(main,/showDecisionIntelligence\?<ChevronUp\/>:<ChevronDown\/>/);
 assert.match(css,/\.decision-intelligence-toggle/);
});

test('collapsed headlines are dynamic and limited to two',()=>{
 assert.match(main,/topNutrient\.definition\.label/);
 assert.match(main,/Pantry needs attention/);
 assert.match(main,/planned meal\$\{planned\.length===1/);
 assert.match(main,/decisionHeadlines\.slice\(0,2\)/);
});

test('required intelligence is revealed inside the expandable region',()=>{
 const disclosure=main.slice(main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">'),main.indexOf('home-summary-dashboard'));
 assert.match(disclosure,/DecisionBrief/);
 assert.match(disclosure,/HighestImpactDecisionExperience/);
 assert.match(disclosure,/DecisionIntelligencePanel/);
 assert.match(disclosure,/DailyCommandCenter/);
 assert.doesNotMatch(disclosure,/summary-rings maintenance-layout/);
 assert.doesNotMatch(disclosure,/className="nutrient-bars"/);
});

test('Nutrition Coverage and Projected Calories are inside the disclosure',()=>{
 const disclosure=main.slice(main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">'),main.indexOf('home-summary-dashboard'));
 assert.match(main,/TODAY’S OUTLOOK/);
 assert.match(main,/Calories/);
 assert.match(css,/\.brief-metrics/);
});

test('release metadata advances to the v1.4.10.43 corrective release',()=>{
 assert.equal(meta.version,'1.4.11.9');
 assert.equal(meta.build,'141190');
 assert.match(main,/const VERSION='1\.4\.11\.9'/);
 assert.match(main,/const BUILD_ID='141190'/);
});
