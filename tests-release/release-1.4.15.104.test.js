import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('ForwardMealPlanner fragment is explicitly closed before function end',()=>{
  assert.match(main,/return <>\{copyFlowOpen[\s\S]*?<\/section>\s*<\/>\s*\}\s*\n\s*function recommendationKey/);
});

test('hotfix release metadata is 1.4.15.104',()=>{
  assert.equal(version.version,'1.4.15.104');
  assert.equal(version.build,'1415104');
  assert.equal(version.schema_version,104);
  assert.match(main,/const VERSION='1\.4\.15\.104'/);
});
