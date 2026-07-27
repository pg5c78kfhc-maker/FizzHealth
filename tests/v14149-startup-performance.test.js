import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createStartupDiagnostics,scheduleDeferredWork} from '../src/startup.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('launch shell is present before the module script',()=>{
  const shell=index.indexOf('class="launch-shell"');
  const script=index.indexOf('type="module"');
  assert.ok(shell>=0);
  assert.ok(script>shell);
  assert.match(index,/background:#080d11/);
  assert.match(index,/Opening your health data/);
});

test('first render is no longer blocked by nutrition backfill',()=>{
  const ready=main.indexOf("setReady(true)");
  const deferred=main.indexOf('scheduleDeferredWork(async()=>');
  const backfill=main.indexOf('await backfillCurrentRecipeMealsOnce()',deferred);
  assert.ok(ready>=0);
  assert.ok(deferred>ready);
  assert.ok(backfill>deferred);
  const bootBlock=main.slice(main.indexOf('const boot=async()=>'),main.indexOf('useEffect(()=>',main.indexOf('const boot=async()=>')));
  assert.doesNotMatch(bootBlock,/backfillCurrentRecipeMealsOnce/);
});

test('startup diagnostics persist phase timing',()=>{
  const values=new Map();
  const storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)};
  const diagnostics=createStartupDiagnostics(storage);
  diagnostics.start('database');
  diagnostics.end('database');
  const result=diagnostics.finish('ready');
  assert.equal(result.status,'ready');
  assert.equal(result.phases[0].name,'database');
  assert.equal(typeof result.phases[0].durationMs,'number');
  assert.match(values.get('fizz-startup-diagnostics-v1'),/"status":"ready"/);
});

test('deferred work errors are isolated',async()=>{
  let captured=null;
  const originalIdle=globalThis.requestIdleCallback;
  const originalCancel=globalThis.cancelIdleCallback;
  globalThis.requestIdleCallback=callback=>{setTimeout(callback,0);return 1};
  globalThis.cancelIdleCallback=()=>{};
  try{
    scheduleDeferredWork(async()=>{throw new Error('bad recipe')},{onError:error=>{captured=error}});
    await new Promise(resolve=>setTimeout(resolve,15));
    assert.equal(captured?.message,'bad recipe');
  }finally{
    if(originalIdle===undefined)delete globalThis.requestIdleCallback;else globalThis.requestIdleCallback=originalIdle;
    if(originalCancel===undefined)delete globalThis.cancelIdleCallback;else globalThis.cancelIdleCallback=originalCancel;
  }
});
