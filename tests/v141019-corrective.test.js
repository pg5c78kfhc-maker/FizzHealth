import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.10.19 release identity is canonical',()=>{
  assert.equal(pkg.version,'1.4.10.19');
  assert.equal(meta.version,'1.4.10.19');
  assert.match(main,/const VERSION='1\.4\.10\.19'/);
  assert.match(main,/version:'1\.4\.10\.19'/);
});

test('Home hierarchy targets actual rendered components',()=>{
  assert.match(css,/\.today-view>\.decision-dashboard\{order:1\}/);
  assert.match(css,/\.today-view>\.today-meals-section\{order:2\}/);
  assert.match(css,/\.today-view>\.decision-intelligence\{order:4\}/);
});

test('nutrition editor compacts during keyboard editing',()=>{
  assert.match(css,/\.nutrition-editor:focus-within \.nutrition-editor-head/);
  assert.match(css,/-webkit-line-clamp:2/);
  assert.match(css,/-webkit-line-clamp:1/);
});
