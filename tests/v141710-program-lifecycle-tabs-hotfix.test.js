import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Programs exposes Active Completed and Set Up lifecycle tabs',()=>{
 assert.match(main,/program-lifecycle-tabs/);
 for(const label of ['Active','Completed','Set Up']) assert.match(main,new RegExp(`>${label} <span>`));
 assert.match(main,/programTabs=\{active:/);
 assert.match(main,/status==='Completed'\|\|p\.status==='Terminated'/);
 assert.match(main,/status==='Planned'/);
 assert.match(css,/\.program-lifecycle-tabs/);
});

test('Set Up templates are date-free and shown as inactive',()=>{
 assert.match(main,/program\.status==='Planned'\?'Inactive':program\.status/);
 assert.match(main,/program\.status!==\'Planned\'/);
 assert.match(main,/status='Planned',start_date=NULL/);
 assert.match(main,/INSERT INTO workout_programs[\s\S]*'Planned',null,weeks/);
});

test('Run creates a separate active instance linked to its template',()=>{
 assert.match(db,/ADD COLUMN template_program_id TEXT/);
 assert.match(main,/activeId=workoutCopyId\('program-run'\)/);
 assert.match(main,/template_program_id\) VALUES/);
 assert.match(main,/program\.program_id\]\);/);
 assert.match(main,/activate-workout-program-instance/);
 assert.match(main,/setActiveTab\('active'\)/);
});

test('migration 145 repairs active programs by recreating reusable setup templates',()=>{
 assert.match(db,/version:145,name:'Program Lifecycle Tabs and Template Instance Separation'/);
 assert.match(db,/program_id\|\|'__setup'/);
 assert.match(db,/status='Active' AND COALESCE\(template_program_id,''\)=''/);
 assert.match(db,/UPDATE workout_programs SET start_date=NULL/);
 assert.match(db,/const TARGET_SCHEMA_VERSION=145/);
});
