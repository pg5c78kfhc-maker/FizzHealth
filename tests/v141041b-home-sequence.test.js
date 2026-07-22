import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('Home sections follow the corrected sequence',()=>{
 const toggle=main.indexOf('decision-intelligence-toggle');
 const summaries=main.indexOf('home-key-summaries',toggle);
 const action=main.indexOf('HighestImpactDecisionExperience',summaries);
 const happens=main.indexOf('DecisionIntelligencePanel',action);
 const focus=main.indexOf('DailyCommandCenter',happens);
 const rings=main.indexOf('home-summary-dashboard',focus);
 const progress=main.indexOf('nutrition-progress-dashboard',rings);
 const meals=main.indexOf('today-meals-section',progress);
 assert.ok(toggle>=0 && summaries>toggle && action>summaries && happens>action && focus>happens && rings>focus && progress>rings && meals>progress);
});

test('intelligence disclosure contains only the required intelligence blocks',()=>{
 const start=main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">');
 const end=main.indexOf('</section><ErrorBoundary label="Decision dashboard">',start);
 const disclosure=main.slice(start,end);
 assert.match(disclosure,/Nutrition coverage/);
 assert.match(disclosure,/Projected calories/);
 assert.match(disclosure,/HighestImpactDecisionExperience/);
 assert.match(disclosure,/DecisionIntelligencePanel/);
 assert.match(disclosure,/DailyCommandCenter/);
 assert.doesNotMatch(disclosure,/summary-rings maintenance-layout/);
 assert.doesNotMatch(disclosure,/className="nutrient-bars"/);
});

test('nutrition progress preserves dynamic top-ten and show-all logic outside intelligence',()=>{
 const start=main.indexOf('nutrition-progress-dashboard');
 const end=main.indexOf('today-meals-section',start);
 const progress=main.slice(start,end);
 assert.match(progress,/orderedBars\.map/);
 assert.match(progress,/nutrientDecisions\.find/);
 assert.match(progress,/hiddenNutrients>0/);
 assert.match(progress,/setShowAllNutrients/);
 assert.match(progress,/Show top 10/);
 assert.match(progress,/Show all nutrients/);
});

test('release metadata advances to v1.4.10.42b',()=>{
 assert.equal(meta.version,'1.4.10.42b');
 assert.equal(meta.build,'141042B');
 assert.match(main,/const VERSION='1\.4\.10\.42b'/);
 assert.match(main,/const BUILD_ID='141042B'/);
});
