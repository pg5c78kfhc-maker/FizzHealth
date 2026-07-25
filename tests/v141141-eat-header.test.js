import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('v1.4.11.41 remains recorded in release history',()=>{
  assert.match(main,/version:'1\.4\.11\.41',name:'Eat Navigation & Library Header Polish'/);
});

test('primary Food destination is renamed Eat',()=>{
  assert.match(main,/label:'Eat'/);
  assert.match(main,/<small>EAT<\/small><h1>Eat<\/h1><p>Choose how you'd like to eat today\.<\/p>/);
  assert.doesNotMatch(main,/<small>FOOD<\/small><h1>Food<\/h1><p>Choose where you want to work\.<\/p>/);
});

test('library selector is centered independently of edge controls',()=>{
  assert.match(css,/\.library-mode-switch\{position:absolute;left:50%;top:8px;transform:translateX\(-50%\)/);
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test('active top mode uses a high-contrast square icon tile without underline',()=>{
  assert.match(css,/\.library-mode-switch button\.active svg\{background:#3f563d/);
  assert.match(css,/border-radius:9px/);
  assert.doesNotMatch(css,/\.library-mode-switch button\.active\{[^}]*border-bottom-color/);
});
