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

test('existing intelligence is revealed inside the expandable region',()=>{
 const disclosure=main.slice(main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">'),main.indexOf('today-meals-section'));
 assert.match(disclosure,/health-assistant-card/);
 assert.match(disclosure,/DecisionIntelligencePanel/);
 assert.match(disclosure,/LDL Support/);
 assert.match(disclosure,/Estimated Maintenance/);
 assert.match(disclosure,/Steps/);
 assert.match(disclosure,/nutrient-bars/);
});

test('Nutrition Coverage and Projected Calories stay visible outside the disclosure',()=>{
 const disclosureEnd=main.indexOf('home-key-summaries');
 const summaries=main.slice(disclosureEnd,main.indexOf('today-meals-section',disclosureEnd));
 assert.match(summaries,/Nutrition coverage/);
 assert.match(summaries,/Projected calories/);
 assert.match(css,/\.home-key-summaries/);
});

test('release metadata advances to the v1.4.10.41a corrective release',()=>{
 assert.equal(meta.version,'1.4.10.41a');
 assert.equal(meta.build,'141041A');
 assert.match(main,/const VERSION='1\.4\.10\.41a'/);
 assert.match(main,/const BUILD_ID='141041A'/);
});
