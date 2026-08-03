import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Series replaces the old chronological label',()=>{
  assert.match(main,/<b>Series<\/b>/);
  assert.doesNotMatch(main,/<b>Oldest episodes first<\/b>/);
});

test('pull-to-refresh refreshes the complete podcast library',()=>{
  assert.match(main,/refreshAllPodcasts=async/);
  assert.match(main,/e\.changedTouches\[0\]\.clientY-pullStart\.current>80/);
  assert.match(main,/SELECT \* FROM podcasts WHERE active=1 AND rss_feed_url IS NOT NULL/);
});

test('playlist remaining time uses days hours minutes seconds and active playback position',()=>{
  assert.match(main,/function formatPlaylistRemaining/);
  assert.match(main,/playback\?\.episode_key===key/);
  assert.match(main,/padStart\(2,'0'\)/);
  assert.match(main,/podcast-playlist-duration/);
});

test('active and inactive sections preserve the master podcast order',()=>{
  assert.match(main,/activeRows=allPodcasts\.filter/);
  assert.match(main,/inactiveRows=allPodcasts\.filter/);
  assert.match(main,/Active \(\{activeRows\.length\}\)/);
  assert.match(main,/Inactive \(\{inactiveRows\.length\}\)/);
  assert.match(main,/ORDER BY COALESCE\(display_order,2147483647\)/);
});

test('activity threshold persists immediately and migration stores feed activity',()=>{
  assert.match(main,/Active Threshold/);
  assert.match(main,/saveActiveThreshold=async/);
  assert.match(main,/active_threshold_months/);
  assert.match(database,/version:120/);
  assert.match(database,/ALTER TABLE podcasts ADD COLUMN last_episode_at TEXT/);
  assert.match(database,/ALTER TABLE podcasts ADD COLUMN last_refreshed_at TEXT/);
  assert.match(css,/podcast-threshold-setting/);
});
