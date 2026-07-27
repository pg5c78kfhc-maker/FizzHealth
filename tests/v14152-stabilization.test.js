import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const db=fs.readFileSync('src/database.js','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const ui=fs.readFileSync('src/main.jsx','utf8');

test('migration 68 creates release_register before inserting release data',()=>{
  const migration=db.slice(db.indexOf("version:68"),db.indexOf('];',db.indexOf("version:68")));
  assert.match(migration,/CREATE TABLE IF NOT EXISTS release_register/);
  assert.ok(migration.indexOf('CREATE TABLE IF NOT EXISTS release_register') < migration.indexOf('INSERT OR IGNORE INTO release_register'));
});

test('Meals library owns a vertical scrolling viewport with bottom clearance',()=>{
  assert.match(css,/\.food-library-page \.list\.foods\.unified-category-library[\s\S]*overflow-y:auto!important/);
  assert.match(css,/touch-action:pan-y/);
  assert.match(css,/var\(--bottom-nav-height\)/);
});

test('scope controls are icon-only and transparent in all states',()=>{
  assert.match(ui,/aria-label=\{label\}[\s\S]*><Icon\/><\/button>/);
  assert.match(css,/\.library-scope-row button,\s*\.library-scope-row button\.active[\s\S]*background:transparent!important/);
  assert.match(css,/\.library-scope-row button\.active\{color:var\(--accent/);
});

test('category swipe rail is constrained and shows all three actions',()=>{
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
  assert.match(css,/width:252px!important/);
  assert.match(css,/white-space:normal!important/);
});

test('release identification is current',()=>{
  assert.match(ui,/const VERSION='1\.4\.15\.2'/);
  assert.match(ui,/const BUILD_ID='141502'/);
  assert.match(ui,/FH-20260727-141502/);
});
