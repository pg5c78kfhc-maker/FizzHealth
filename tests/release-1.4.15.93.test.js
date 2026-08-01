import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('health metrics use the approved order',()=>{
 const block=main.slice(main.indexOf('const HEALTH_METRICS=['),main.indexOf('const metricDefinition='));
 const order=['weight','steps','blood_pressure','resting_heart_rate','sleep','waist','workout'];
 let at=-1; for(const type of order){const next=block.indexOf(`type:'${type}'`);assert.ok(next>at,`${type} is in order`);at=next}
});
test('cards preserve edit tap and expose independent information tap',()=>{
 assert.match(main,/className="health-card-main" onClick=\{\(\)=>setSelected/);
 assert.match(main,/className=\{`health-info-button/);
 assert.match(main,/onClick=\{\(\)=>setInfoType\(def\.type\)\}/);
});
test('history area is a single context-sensitive information panel',()=>{
 assert.match(main,/className="health-info-panel"/);
 assert.match(main,/HISTORY & CONTEXT/);
 assert.match(main,/Full history/);
 assert.doesNotMatch(main,/className="metric-history-links"/);
});
test('compact grid styling stays two across on small iPhones',()=>{
 assert.match(styles,/\.health-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(styles,/@media\(max-width:390px\)\{\.health-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
test('release metadata is consistently version 1.4.15.93',()=>{
 assert.equal(version.version,'1.4.15.93');assert.equal(version.build,'141593');assert.equal(version.deployment_id,'FH-20260801-141593');assert.match(main,/const VERSION='1\.4\.15\.93'/);
});
