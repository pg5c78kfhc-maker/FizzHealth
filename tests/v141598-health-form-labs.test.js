import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('Health editor is a new body portal with visual viewport geometry',()=>{
 assert.match(main,/return createPortal\(form,document\.body\)/);
 assert.match(main,/window\.visualViewport/);
 assert.match(main,/health-metric-form-scroll/);
 assert.doesNotMatch(css,/health-editor-backdrop/);
 assert.doesNotMatch(css,/health-editor-scroll/);
 assert.match(css,/\.health-metric-form-new\{[^}]*display:flex;flex-direction:column/);
 assert.match(css,/\.health-metric-form-scroll\{[^}]*flex:1 1 auto;min-height:0;[^}]*overflow-y:auto/);
});
test('Health editor has no Delete action and preserves X and check actions',()=>{
 const block=main.slice(main.indexOf('function HealthMetricEditor'),main.indexOf('function MetricLineChart'));
 assert.doesNotMatch(block,/Trash2|Delete/);
 assert.match(block,/aria-label="Cancel editing"/);
 assert.match(block,/aria-label="Save reading"/);
});
test('laboratory migration contains all workbook rows and preserves fasting status',()=>{
 assert.match(db,/version:98,name:'replace_health_forms_and_seed_laboratory_history'/);
 assert.equal((db.match(/INSERT OR IGNORE INTO lab_results/g)||[]).length,54);
 assert.equal((db.match(/INSERT OR IGNORE INTO health_metrics\(metric_type,value_primary/g)||[]).length,46);
 assert.match(db,/ALTER TABLE lab_results ADD COLUMN text_value TEXT/);
 assert.match(db,/'Fasting Status',NULL,'Non-fasted'/);
 assert.match(db,/'LDL Cholesterol',178/);
});
test('Labs UI includes textual and numeric results',()=>{
 assert.match(main,/Number\.isFinite\(r\.value\)\|\|r\.text_value/);
 assert.match(main,/displayValue=Number\.isFinite\(row\.value\)\?row\.value:\(row\.text_value\|\|'Not recorded'\)/);
 assert.match(main,/fastingRow\?\.text_value/);
});
test('release metadata is current',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.98'/);
 assert.match(db,/TARGET_SCHEMA_VERSION=98/);
});
