import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('release version is 1.4.16.58', () => {
  assert.equal(pkg.version, '1.4.16.58');
  assert.match(main, /const VERSION='1\.4\.16\.58'/);
});

test('playlist refresh uses one coordinator and merges duplicate pulls', () => {
  assert.match(main, /playlistRefreshCoordinatorRef=useRef\(null\)/);
  assert.match(main, /event:'duplicate-refresh-merged'/);
  assert.match(main, /return playlistRefreshCoordinatorRef\.current\.promise/);
});

test('per-podcast refresh defers projection rebuilding', () => {
  assert.match(main, /deferPlaylistRebuild=Boolean\(options\.deferPlaylistRebuild\)/);
  assert.match(main, /refreshSubscriptions\.length&&!deferPlaylistRebuild/);
  assert.match(main, /deferPlaylistRebuild:true/);
});

test('playlist projection and playback queue rebuild once after feeds settle', () => {
  const block = main.slice(main.indexOf('const runPlaylistRefresh='), main.indexOf('const refreshCurrentPlaylist='));
  assert.equal((block.match(/await rebuildPodcastPlaylistProjection\(/g) || []).length, 1);
  assert.equal((block.match(/await applyStoredPlaylistFilters\(/g) || []).length, 1);
  assert.equal((block.match(/reason:'playlist-refresh-final'/g) || []).length, 1);
  assert.match(block, /rebuildCount:1/);
});

test('refresh recovery marker persists active stage and restarts after interruption', () => {
  assert.match(main, /fizz\.podcast\.playlist-refresh\.v1/);
  assert.match(main, /event:'interrupted-refresh-detected'/);
  assert.match(main, /runPlaylistRefresh\(marker\.playlistId,\{recovery:true\}\)/);
});

test('large-feed protection is serialized and bounded', () => {
  assert.match(main, /concurrency:1/);
  assert.match(main, /memoryProtectionMode:'serial-release'/);
  assert.match(main, /batchSize:75/);
});

test('individual feed failures remain isolated', () => {
  assert.match(main, /playlist-refresh-feed-isolated/);
  assert.match(main, /if\(!ok\)failed\+=1/);
  assert.match(main, /failed\?'PARTIAL FAILURE':'SUCCESS'/);
});
