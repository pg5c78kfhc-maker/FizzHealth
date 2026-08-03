import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync('src/styles.css','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');

test('release metadata is v1.4.16.9',()=>{
  assert.match(main,/const VERSION='1\.4\.16\.9'/);
  assert.match(db,/version:114,name:'Podcast Library Experience'/);
});

test('podcast cards use compact dark layout',()=>{
  assert.match(css,/\.podcast-reorder-list>article>button\{[^}]*min-height:94px[^}]*background:#121a20/s);
  assert.match(css,/grid-template-columns:68px minmax\(0,1fr\) 28px/);
});

test('podcast title and publisher align to top',()=>{
  assert.match(css,/align-items:start/);
  assert.match(css,/align-content:start/);
  assert.match(css,/color:#fff/);
});

test('podcast chevron is positioned at far right',()=>{
  assert.match(css,/button>svg\{[^}]*justify-self:end[^}]*align-self:center/s);
});

test('existing podcast organization controls remain available',()=>{
  assert.match(main,/Oldest episodes first/);
  assert.match(main,/Automatically add qualifying unplayed episodes|Automatically add qualifying|Up Next/);
  assert.match(main,/reorderPodcasts/);
});
