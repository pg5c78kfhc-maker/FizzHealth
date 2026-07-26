import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
test('v1.4.13.7A removes unapproved item arrows and promoted-source copy',()=>{
 assert.doesNotMatch(main,/onRank\(meal/);
 assert.doesNotMatch(main,/<MoveRight\/>/);
 assert.match(main,/cleanDescription/);
 assert.match(css,/\.menu-card-actions\{display:none!important\}/);
});
test('v1.4.13.7A uses compact menu metrics and fixed navigation',()=>{
 assert.match(main,/<small>kcal<\/small>/);
 assert.match(main,/<small>protein<\/small>/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) 66px/);
 assert.match(css,/\.app>nav\{position:fixed!important/);
});
test('v1.4.13.7A compacts section headings and applies menu typography',()=>{
 assert.match(main,/Chef's Picks/);
 assert.match(main,/Powered by AI/);
 assert.match(main,/section.items.length===1\?'item':'items'/);
 assert.match(css,/menu-category-heading h3.*font-family:Georgia/);
});
