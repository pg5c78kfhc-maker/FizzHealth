import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('startup does not reload on service-worker controller change',()=>{
  assert.doesNotMatch(ui,/controllerchange[^\n]*window\.location\.reload/);
  assert.match(ui,/update activated; it will be used without reloading/);
});

test('database startup and UI retry are serialized',()=>{
  assert.match(db,/let openDatabasePromise=null/);
  assert.match(db,/if\(openDatabasePromise\)return openDatabasePromise/);
  assert.match(ui,/if\(bootInFlight\.current\)return bootInFlight\.current/);
  assert.match(ui,/disabled=\{booting\}/);
});

test('database startup is not abandoned by a timeout race',()=>{
  assert.doesNotMatch(ui,/withStartupTimeout/);
});

test('release metadata identifies v1.4.15.3 and schema 69',()=>{
  assert.equal(pkg.version,'1.4.15-3');
  assert.match(ui,/const VERSION='1\.4\.15\.3'/);
  assert.match(ui,/const BUILD_ID='141503'/);
  assert.match(ui,/FH-20260727-141503/);
  assert.match(db,/const TARGET_SCHEMA_VERSION=69/);
  assert.match(db,/version:69,name:'startup_loop_recovery'/);
});
