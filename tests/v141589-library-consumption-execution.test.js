import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('Library full swipe reads synchronous gesture refs on release',()=>{
  const start=main.indexOf('function SwipeArchiveCard');
  const end=main.indexOf('const UNIT_GROUPS',start);
  const block=main.slice(start,end);
  assert.match(block,/offsetRef=useRef\(0\)/);
  assert.match(block,/commitReadyRef=useRef\(false\)/);
  assert.match(block,/const currentOffset=offsetRef\.current/);
  assert.match(block,/commit=commitReadyRef\.current/);
  assert.match(block,/onFullSwipe\?\.\(\)/);
  assert.doesNotMatch(block,/commit=commitReady;/);
});

test('Library consumption execution is traced from gesture through commit',()=>{
  for(const stage of ['gesture-start','commit-threshold','gesture-release','quick-consume-dispatch','quick-consume-enter','transaction-start','transaction-write-complete','transaction-committed','transaction-failed']){
    assert.match(main,new RegExp(`['\"]${stage}['\"]`));
  }
});

test('Library foods, recipes and meals retain full-swipe quick consume bindings',()=>{
  assert.match(main,/onFullSwipe=\{\(\)=>quickConsume\('food',x\)\}/);
  assert.match(main,/onFullSwipe=\{\(\)=>quickConsume\('recipe',x\)\}/);
  assert.match(main,/onFullSwipe=\{\(\)=>quickConsume\('meal',x\)\}/);
});

test('release metadata is v1.4.15.89',()=>{
  assert.match(main,/const VERSION='1\.4\.15\.89'/);
  assert.match(main,/const BUILD_ID='141589'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260731-141589'/);
});
