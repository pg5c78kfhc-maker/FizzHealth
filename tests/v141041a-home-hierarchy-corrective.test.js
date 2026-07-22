import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('persistent summaries render before expanded Decision Intelligence content',()=>{
 const toggle=main.indexOf('decision-intelligence-toggle');
 const summaries=main.indexOf('home-key-summaries',toggle);
 const expanded=main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">',toggle);
 const meals=main.indexOf('today-meals-section',toggle);
 assert.ok(toggle>=0 && summaries>toggle && expanded>summaries && meals>expanded);
});

test('Nutrition Coverage and Projected Calories remain outside conditional expansion',()=>{
 const summaries=main.slice(main.indexOf('home-key-summaries'),main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">'));
 assert.match(summaries,/Nutrition coverage/);
 assert.match(summaries,/Projected calories/);
 assert.doesNotMatch(summaries,/showDecisionIntelligence&&/);
});

test('expanded intelligence remains conditional and below summaries',()=>{
 const expanded=main.slice(main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">'),main.indexOf('today-meals-section'));
 assert.match(expanded,/health-assistant-card/);
 assert.match(expanded,/DecisionIntelligencePanel/);
 assert.match(expanded,/LDL Support/);
 assert.match(expanded,/Estimated Maintenance/);
 assert.match(expanded,/Steps/);
 assert.match(css,/\.decision-intelligence-content\{order:3/);
});

test('release metadata is v1.4.10.41a',()=>{
 assert.equal(meta.version,'1.4.10.41a');
 assert.equal(meta.build,'141041A');
 assert.match(main,/const VERSION='1\.4\.10\.41a'/);
 assert.match(main,/const BUILD_ID='141041A'/);
});
