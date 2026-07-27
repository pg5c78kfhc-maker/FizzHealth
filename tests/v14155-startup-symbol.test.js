import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {withStartupTimeout} from '../src/startup.js';

test('main imports withStartupTimeout from startup module',()=>{
  const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.match(main,/import \{createStartupDiagnostics,scheduleDeferredWork,withStartupTimeout\} from '\.\/startup';/);
  assert.match(main,/await withStartupTimeout\(openDatabase/);
});

test('withStartupTimeout is exported and resolves completed startup',async()=>{
  assert.equal(typeof withStartupTimeout,'function');
  assert.equal(await withStartupTimeout(Promise.resolve('ready'),50),'ready');
});

test('withStartupTimeout rejects stalled startup',async()=>{
  await assert.rejects(()=>withStartupTimeout(new Promise(()=>{}),5,'startup stalled'),/startup stalled/);
});

test('release metadata is v1.4.15.5',()=>{
  const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.match(main,/const VERSION='1\.4\.15\.5'/);
  assert.match(main,/const BUILD_ID='141505'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260727-141505'/);
});
