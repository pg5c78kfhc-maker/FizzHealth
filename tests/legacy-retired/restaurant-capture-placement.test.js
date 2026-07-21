import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('restaurant pages expose Universal Capture at the top',()=>{
  assert.match(main,/function RestaurantUniversalCapture/);
  assert.match(main,/Restaurants\(\{refresh,done,openData,openCapture\}\)/);
  assert.equal((main.match(/<RestaurantUniversalCapture openCapture=\{openCapture\}\/>/g)||[]).length,2);
  assert.match(styles,/\.restaurant-universal-capture/);
});

test('Daily Dashboard no longer renders a duplicate primary Capture button',()=>{
  const block=main.slice(main.indexOf('function DailyCommandCenter'),main.indexOf('function AddMeal'));
  assert.doesNotMatch(block,/className="primary" onClick=\{onCapture\}><Plus\/> Capture/);
});
