import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release identity is v1.4.13.9A',()=>{
  assert.equal(version.version,'1.4.13.9A');
  assert.equal(version.build,'141309A');
  assert.equal(version.release_id,'FH-20260726-141309A');
});

test('menu title spans both card columns',()=>{
  assert.match(css,/\.white-menu-list \.menu-card-title-line\{grid-column:1\/-1;grid-row:1/);
  assert.match(css,/\.white-menu-list \.restaurant-menu-copy\{display:contents\}/);
});

test('description spans both card columns',()=>{
  assert.match(css,/\.white-menu-list \.restaurant-menu-copy>p\{grid-column:1\/-1;grid-row:2/);
});

test('recommendations and nutrition share lower row',()=>{
  assert.match(css,/\.white-menu-list \.menu-recommendation-row\{grid-column:1;grid-row:3/);
  assert.match(css,/\.white-menu-list \.restaurant-menu-nutrition\{grid-column:2;grid-row:3/);
});

test('menu card behavior remains present',()=>{
  assert.match(main,/onPointerDown=\{down\}/);
  assert.match(main,/onClick=\{e=>\{e\.stopPropagation\(\);onFavorite\(meal\)\}\}/);
  assert.match(main,/onKeyDown=\{e=>/);
});
