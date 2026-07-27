import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('v1.4.14.5 loads Nothing You Could Do',()=>{
  assert.match(html,/family=Nothing\+You\+Could\+Do/);
  assert.match(css,/--menu-handwriting:"Nothing You Could Do"/);
});

test('handwriting is scoped to restaurant and category names',()=>{
  assert.match(css,/restaurant-menu-group>\.menu-category-heading h3/);
  assert.match(css,/menu-category:not\(\.chef-section\):not\(\.restaurant-menu-group\)>\.menu-category-heading h3/);
  assert.match(css,/restaurant-category-heading h4/);
  assert.match(css,/chef-section \.menu-category-heading h3[\s\S]*font-family:system-ui/);
});

test('restaurant and category vertical whitespace is reduced',()=>{
  assert.match(css,/restaurant-category-sections\{[\s\S]*gap:0!important;[\s\S]*padding:0!important/);
  assert.match(css,/restaurant-menu-group>\.menu-category-heading\{[\s\S]*min-height:50px!important;[\s\S]*padding:7px 12px!important/);
  assert.match(css,/restaurant-category-heading\{[\s\S]*min-height:52px!important;[\s\S]*padding:7px 12px!important/);
});

test('release metadata is current',()=>{
  assert.match(main,/const VERSION='1\.4\.14\.5'/);
  assert.match(main,/const BUILD_ID='141405'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260727-141405'/);
});
