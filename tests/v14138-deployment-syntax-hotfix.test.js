import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.13.8 closes the Restaurant Day async JSX handler before rendering the switch contents',()=>{
  assert.match(main,/onClick=\{async\(\)=>\{try\{await setRestaurantPreference\(!restaurantDay\)\}catch\(e\)\{window\.alert\(e\.message\)\}\}\}><i\/>/);
  assert.doesNotMatch(main,/onClick=\{async\(\)=>\{try\{await setRestaurantPreference\(!restaurantDay\)\}catch\(e\)\{window\.alert\(e\.message\)\}\}><i\/>/);
});

test('v1.4.13.8 deployment metadata is centralized and current',()=>{
  assert.equal(meta.version,'1.4.13.8');
  assert.equal(meta.build,'141308');
  assert.equal(meta.release_id,'FH-20260726-141308');
  assert.match(main,/const VERSION='1\.4\.13\.8'/);
});
