import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('General Interest uses its own independent React state key',()=>{
  assert.match(main,/playlistId==='drama'\?'drama':playlistId==='general-interest'\?'generalInterest'/);
  assert.match(main,/checked=\{playlistSubscriptions\.generalInterest\}/);
  assert.match(main,/savePlaylistSubscription\('general-interest',e\.target\.checked\)/);
});

test('playlist assignment refreshes library immediately before feed reconciliation',()=>{
  const start=main.indexOf('const savePlaylistSubscription=async');
  const end=main.indexOf('const importOpmlFile=',start);
  const body=main.slice(start,end);
  const firstTick=body.indexOf('setTick(x=>x+1)');
  const load=body.indexOf('await loadEpisodes(selected)');
  assert.ok(firstTick>=0 && load>=0 && firstTick<load);
  assert.match(body,/fizz:podcast-playlist-assignment/);
  assert.match(body,/uiRefreshTriggered:true/);
});

test('General Interest participates in library grouping and no assigned podcast remains unassigned',()=>{
  assert.match(main,/subs\.includes\('general-interest'\)\?'general-interest':'unassigned'/);
  assert.match(main,/\['general-interest','General Interest'\]/);
});

test('General Interest participates in reorder filtering and duration reporting',()=>{
  assert.match(main,/applyStoredPlaylistFilters\('general-interest'\)/);
  assert.match(main,/generalInterestRemaining=formatPlaylistRemaining\(generalInterest,podcastPlayback\)/);
});

test('playlist carousel has safe vertical separation below header',()=>{
  assert.match(css,/\.podcast-playlist-carousel\{[^}]*margin-top:14px;[^}]*padding:10px 10px 18px;/);
  assert.match(css,/@media\(max-width:520px\)\{\.podcast-playlist-carousel\{[^}]*margin-top:16px;/);
});

test('release metadata is v1.4.16.33',()=>{
  assert.match(main,/const VERSION='1\.4\.16\.33'/);
  assert.match(main,/const BUILD_ID='141633'/);
});
