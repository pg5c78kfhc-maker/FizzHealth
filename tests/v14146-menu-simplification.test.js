import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');

test('Caveat replaces prior handwriting and remains scoped to menu hierarchy',()=>{
  assert.match(html,/family=Caveat:wght@600;700/);
  assert.match(css,/--menu-handwriting:"Caveat"/);
  assert.doesNotMatch(html,/Nothing\+You\+Could\+Do/);
  assert.match(css,/\.restaurant-menu-group>\.menu-category-heading h3/);
  assert.match(css,/\.restaurant-category-heading h4/);
  assert.match(css,/\.chef-section \.menu-category-heading h3[\s\S]*font-family:system-ui/);
});

test('Today Menu category browse filter row is removed',()=>{
  assert.doesNotMatch(main,/Today’s Menu filters/);
  assert.doesNotMatch(main,/filters\.map\(filter/);
  const plannerState=main.match(/function ForwardMealPlanner[\s\S]*?const currentDayRef/)?.[0]||'';
  assert.doesNotMatch(plannerState,/menuFilter/);
});

test('category sections are stacked without outer gaps',()=>{
  assert.match(css,/\.today-menu\{gap:0!important\}/);
  assert.match(css,/\.menu-category\{margin-bottom:0!important\}/);
  assert.match(css,/restaurant-category-section\+\.restaurant-category-section\{margin-top:0!important\}/);
});

test('Chef image foundation is pantry-only and does not fetch externally',()=>{
  assert.match(main,/CHEF_IMAGE_CACHE_KEY='fizz-chef-pantry-image-cache-v1'/);
  assert.match(main,/planner_source\|\|''\)==='restaurant'\)return ''/);
  assert.match(main,/image_url\|\|meal\.photo_url\|\|meal\.thumbnail_url/);
  assert.match(main,/imageUrl=\{chefPickImageUrl\(meal\)\}/);
  assert.doesNotMatch(main,/fetch\([^)]*chef/i);
});
