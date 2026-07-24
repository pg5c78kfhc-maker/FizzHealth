import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('Today isolates optional analytics failures',()=>{
  for(const label of ['maintenance estimate','health intelligence','end-of-day prediction','decision queue','nutrition debt','weekly health forecast','decision timeline','goal probabilities','LDL decision','steps decision']) assert.match(source,new RegExp(`safeValue\\('${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}'`));
});
test('Today core historical reads are defensive',()=>{
  assert.match(source,/const planned=optionalQuery\(`/);
  assert.match(source,/const stepsRow=optionalQuery\(`/);
  assert.match(source,/const dailyHistory=optionalQuery\(`/);
  assert.match(source,/const weightHistory=optionalQuery\(`/);
});
test('runtime fallback exposes the actual exception',()=>assert.match(source,/widget-error-detail/));
