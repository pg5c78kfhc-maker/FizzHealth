import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Menu Chef section is isolated from standalone Chef page',()=>{
  assert.equal((main.match(/className="menu-category menu-chef-section"/g)||[]).length,1);
  assert.equal((main.match(/className="menu-category chef-section"/g)||[]).length,0);
});

test('quantity-only Pantry records do not activate package validation from unit alone',()=>{
  assert.match(main,/hasAnyPackageDetail=\[packageCount,containerSize,unopenedPackages,partialPackageQuantity\]\.some\(value=>value!==null\)\|\|Boolean\(packageType\)/);
  assert.doesNotMatch(main,/Boolean\(packageType\|\|containerUnit\)/);
});

test('Pantry validation is visible beside the sticky header',()=>{
  assert.match(main,/className="pantry-save-error" role="alert"/);
  assert.match(css,/\.pantry-property-editor \.pantry-save-error\{[\s\S]*position:sticky/);
});

test('one canonical Menu Chef layout remains and obsolete patch blocks are gone',()=>{
  assert.equal((css.match(/CANONICAL Menu\/Chef layout/g)||[]).length,1);
  assert.doesNotMatch(css,/v1\.4\.15\.8 stabilization: exact Menu stack geometry/);
  assert.doesNotMatch(css,/v1\.4\.15\.9 — structural Menu geometry/);
});

test('canonical layout directly joins planned meals to Today menu and expands Chef media',()=>{
  assert.match(css,/\.meal-calendar-prototype\{\s*row-gap:0;/);
  assert.match(css,/\.meal-calendar-prototype \.planned-meals-menu\{\s*margin-bottom:0;/);
  assert.match(css,/\.meal-calendar-prototype \.today-menu\{[\s\S]*margin:0 auto;[\s\S]*padding:0 0/);
  assert.match(css,/\.restaurant-menu-card\.has-chef-image>\.chef-pick-image\{[\s\S]*width:calc\(100% \+ 28px\);[\s\S]*object-fit:cover/);
});
