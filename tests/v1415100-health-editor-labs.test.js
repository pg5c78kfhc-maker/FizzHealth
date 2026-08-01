import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('one shared keyboard-safe Health editor remains',()=>{
 assert.match(main,/function HealthMetricEditor/);
 assert.match(main,/--health-editor-height/);
 assert.match(main,/className="health-editor-shell"/);
 assert.match(main,/className="health-editor-scroll"/);
 assert.doesNotMatch(main,/health-metric-modal-new|health-metric-form-new|health-metric-form-scroll|viewport\.top|viewport\.height/);
 assert.match(css,/\.health-editor-shell\{height:100%;min-height:0;display:flex;flex-direction:column/);
 assert.match(css,/\.health-editor-scroll\{flex:1 1 auto;min-height:0;overflow-y:auto/);
});

test('Blood Pressure retains two numeric fields',()=>{
 assert.match(main,/secondaryLabel:'Diastolic'/);
 assert.match(main,/health-editor-bp/);
 assert.match(main,/Systolic/);
 assert.match(main,/inputMode="numeric"/);
});

test('Health timeline supports metric deletion and undo outside editor',()=>{
 assert.match(main,/async function deleteTimelineEvent/);
 assert.match(main,/DELETE FROM health_metrics WHERE id=\?/);
 assert.match(main,/kind:'metric'/);
 assert.match(main,/async function undoTimelineEvent/);
 assert.match(main,/INSERT INTO health_metrics/);
 assert.doesNotMatch(main,/health-delete-reading/);
});

test('Labs cards contain value unit and range in one aligned card',()=>{
 assert.match(main,/className={`lab-value-card \$\{state\}`}/);
 assert.match(main,/<strong>\{displayValue\}<\/strong><em>\{row\.unit\|\|'No unit'\}<\/em><small>\{labRangeText\(row\)\}<\/small>/);
 assert.match(css,/\.labs-value-row\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(132px,168px\)/);
 assert.match(css,/\.lab-value-card\.unknown\{background:#b8babc;color:#090b0c\}/);
 assert.doesNotMatch(main,/labs-value-reading|lab-value-pill/);
});
