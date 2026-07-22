import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('41b supersedes 41a by placing summaries inside the conditional disclosure',()=>{
 const conditional=main.indexOf('{showDecisionIntelligence&&<div className="decision-intelligence-content">');
 const summaries=main.indexOf('home-key-summaries',conditional);
 const rings=main.indexOf('home-summary-dashboard',summaries);
 assert.ok(conditional>=0 && summaries>conditional && rings>summaries);
});
