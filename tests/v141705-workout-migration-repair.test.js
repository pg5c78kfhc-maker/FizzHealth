import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const dbSource=fs.readFileSync('src/database.js','utf8');
const seedSource=fs.readFileSync('src/workouts/historyImportSql.js','utf8');

function splitSqlStatements(sql){
  const statements=[];let current='';let quote=null;
  for(let i=0;i<String(sql||'').length;i++){
    const char=sql[i],next=sql[i+1];current+=char;
    if(quote){if(char===quote){if(next===quote){current+=next;i++}else quote=null}continue}
    if(char==="'"||char==='"'||char==='`'){quote=char;continue}
    if(char===';'){const statement=current.slice(0,-1).trim();if(statement)statements.push(statement);current=''}
  }
  if(current.trim())statements.push(current.trim());return statements;
}
function historySql(){return seedSource.split('String.raw`',2)[1].replace(/`;\s*$/,'')}
function runCompatible(db,sql){
  for(const statement of splitSqlStatements(sql)){
    try{db.exec(statement)}catch(error){const msg=String(error?.message||error).toLowerCase();if(msg.includes('duplicate column name')||msg.includes('already exists'))continue;throw error}
  }
}

test('migration 141 upgrades the legacy workout_sessions schema in place',()=>{
  for(const column of ['source_key','workout_name','program_name','day_label','week_number','performed_at','performed_date','duration_source_text','chronological_order','source_header']){
    assert.match(dbSource,new RegExp(`ALTER TABLE workout_sessions ADD COLUMN ${column}`));
  }
  assert.match(dbSource,/idx_workout_sessions_chronological ON workout_sessions\(performed_at,chronological_order\)/);
  assert.match(dbSource,/idx_workout_sessions_source_key ON workout_sessions\(source_key\) WHERE source_key IS NOT NULL/);
});

test('schema-140-style legacy workout_sessions upgrades, preserves data, imports history, and safely retries',()=>{
  const db=new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE workout_sessions (session_id TEXT PRIMARY KEY,local_date TEXT NOT NULL,workout TEXT,program TEXT,duration_minutes REAL,location TEXT,source TEXT,notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE workout_exercises (exercise_id TEXT PRIMARY KEY,workout_id TEXT NOT NULL,name TEXT NOT NULL,sets INTEGER NOT NULL DEFAULT 3,reps INTEGER NOT NULL DEFAULT 10,notes TEXT,display_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    INSERT INTO workout_sessions(session_id,local_date,workout,program,duration_minutes,source,created_at,updated_at) VALUES ('legacy-1','2026-01-01','Legacy Workout','Legacy Program',30,'workbook','2026-01-01','2026-01-01');`);
  runCompatible(db,historySql());
  const columns=db.prepare('PRAGMA table_info(workout_sessions)').all().map(row=>row.name);
  assert.ok(columns.includes('performed_at'));assert.ok(columns.includes('source_key'));
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM workout_sessions WHERE session_id='legacy-1'").get().n,1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM workout_sessions WHERE source='workout-pdf-import'").get().n,138);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM exercise_library').get().n,41);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM workout_session_exercises').get().n,786);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM workout_session_sets').get().n,2848);
  runCompatible(db,historySql());
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM workout_sessions WHERE source='workout-pdf-import'").get().n,138);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM workout_session_sets').get().n,2848);
});

test('historical session seed satisfies legacy non-null columns while retaining new history fields',()=>{
  assert.match(seedSource,/workout_sessions\(session_id,local_date,workout,program,duration_minutes,source,created_at,updated_at,source_key,workout_name,program_name,day_label,week_number,performed_at,performed_date,duration_source_text,chronological_order,source_header\)/);
  assert.equal((seedSource.match(/INSERT OR IGNORE INTO workout_sessions\(/g)||[]).length,138);
  assert.match(seedSource,/'workout-pdf-import'/);
});

test('corrective release metadata identifies v1.4.17.5 while retaining schema 141',()=>{
  assert.match(dbSource,/TARGET_SCHEMA_VERSION=141/);
  assert.match(dbSource,/'1\.4\.17\.5','2026-08-07','141705',141,'Workout History Migration Compatibility Repair'/);
});
