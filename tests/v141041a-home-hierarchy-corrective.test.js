import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('43 supersedes the legacy summaries with a Decision Brief inside the disclosure',()=>{const conditional=main.indexOf('{showDecisionIntelligence&&<div className=\"decision-intelligence-content\">');const brief=main.indexOf('DecisionBrief',conditional);const rings=main.indexOf('home-summary-dashboard',brief);assert.ok(conditional>=0&&brief>conditional&&rings>brief);});
