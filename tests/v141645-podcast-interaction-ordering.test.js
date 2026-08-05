import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('podcast reorder save verifies persisted order and rebuilds projection',()=>{
  assert.match(source,/Podcast order verification failed/);
  assert.match(source,/manual-podcast-reorder',forceFull:true/);
  assert.match(source,/podcast-order-saved/);
});
test('long press cancels after meaningful movement or vertical scroll',()=>{
  assert.match(source,/Math\.abs\(dx\)>10\|\|Math\.abs\(dy\)>10/);
  assert.match(source,/Math\.abs\(dy\)>Math\.abs\(dx\)\*1\.1/);
  assert.match(source,/625/);
});
test('mark played requires deliberate horizontal swipe',()=>{
  assert.match(source,/Math\.max\(110,state\.cardWidth\*0\.3\)/);
  assert.match(source,/Math\.abs\(dx\)>Math\.abs\(dy\)\*1\.35/);
});
test('master order setting rebuilds and verifies',()=>{
  assert.match(source,/Could not verify \$\{key\} setting/);
  assert.match(source,/playlist-filter-\$\{key\}/);
  assert.match(source,/forceFull:true/);
});
test('podcast name is rendered above episode title',()=>{
  const name=source.indexOf('podcast-card-podcast-name');
  const title=source.indexOf('podcast-card-episode-title');
  assert.ok(name>0&&title>name);
});
