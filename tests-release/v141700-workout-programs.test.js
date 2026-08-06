import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release version is consistent',()=>{
 assert.equal(pkg.version,'1.4.17.0');
 assert.equal(version.version,'1.4.17.0');
 assert.match(main,/const VERSION='1\.4\.17\.0'/);
 assert.equal(version.schema_version,137);
});

test('Workout is a permanent footer destination',()=>{
 assert.match(main,/id:'workouts',I:Dumbbell,label:'Workout'/);
 assert.match(main,/tab==='workouts'.*WorkoutProgramsPage/);
 assert.match(styles,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
});

test('program migration persists agreed fields',()=>{
 for(const field of ['program_id','name TEXT NOT NULL','description TEXT','goal TEXT','status TEXT','start_date TEXT','duration_weeks INTEGER','notes TEXT','created_at TEXT','updated_at TEXT']) assert.ok(database.includes(field),field);
 assert.match(database,/version:137,name:'Workout Programs Foundation'/);
});

test('program UI supports list, create, edit, and calculated end date',()=>{
 assert.match(main,/function WorkoutProgramsPage/);
 assert.match(main,/function WorkoutProgramEditor/);
 assert.match(main,/addProgramDuration/);
 assert.match(main,/UPDATE workout_programs/);
 assert.match(main,/INSERT INTO workout_programs/);
 assert.match(main,/Expected end date/);
});
