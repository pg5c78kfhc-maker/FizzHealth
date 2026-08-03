import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import pkg from '../package.json' with {type:'json'};
import {buildReconciledPlaylistOrder,selectQualifyingPlaylistEpisodes} from '../src/podcast/playlistReconciliation.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

const episodes=[
  {guid:'old',published_at:'2026-08-01T10:00:00Z',enclosure_url:'https://audio/old.mp3'},
  {guid:'middle',published_at:'2026-08-02T10:00:00Z',enclosure_url:'https://audio/middle.mp3'},
  {guid:'new',published_at:'2026-08-03T10:00:00Z',enclosure_url:'https://audio/new.mp3'},
];
const key=e=>e.guid;

test('release metadata is v1.4.16.11',()=>{
  assert.equal(pkg.version,'1.4.16.11');
  assert.match(main,/VERSION='1\.4\.16\.11'/);
  assert.match(main,/BUILD_ID='141611'/);
  assert.match(db,/version:116/);
});

test('latest-only selects the literal newest episode',()=>{
  const selected=selectQualifyingPlaylistEpisodes(episodes,{showLatestOnly:true,playedKeys:new Set(),episodeKey:key});
  assert.deepEqual(selected.map(key),['new']);
});

test('latest-only returns none when newest episode is played',()=>{
  const selected=selectQualifyingPlaylistEpisodes(episodes,{showLatestOnly:true,playedKeys:new Set(['new']),episodeKey:key});
  assert.deepEqual(selected,[]);
});

test('all episodes sort oldest to newest when configured',()=>{
  const selected=selectQualifyingPlaylistEpisodes(episodes,{oldestFirst:true,playedKeys:new Set(),episodeKey:key});
  assert.deepEqual(selected.map(key),['old','middle','new']);
});

test('all episodes sort newest to oldest by default',()=>{
  const selected=selectQualifyingPlaylistEpisodes(episodes,{oldestFirst:false,playedKeys:new Set(),episodeKey:key});
  assert.deepEqual(selected.map(key),['new','middle','old']);
});

test('played episodes are removed from reconciliation candidates',()=>{
  const selected=selectQualifyingPlaylistEpisodes(episodes,{oldestFirst:true,playedKeys:new Set(['middle']),episodeKey:key});
  assert.deepEqual(selected.map(key),['old','new']);
});

test('reconciliation replaces one podcast block without disturbing other podcast order',()=>{
  const rows=[
    {item_id:'a1',podcast_id:'a'},
    {item_id:'b1',podcast_id:'b'},
    {item_id:'b2',podcast_id:'b'},
    {item_id:'c1',podcast_id:'c'},
  ];
  const eligible=[{kind:'eligible',podcast_id:'b',episode_key:'b-new'}];
  const result=buildReconciledPlaylistOrder(rows,'b',eligible);
  assert.deepEqual(result.map(row=>row.item_id||row.episode_key),['a1','b-new','c1']);
});

test('newly subscribed podcast appends its ordered block to the playlist',()=>{
  const rows=[{item_id:'a1',podcast_id:'a'},{item_id:'c1',podcast_id:'c'}];
  const eligible=[{kind:'eligible',podcast_id:'b',episode_key:'b1'},{kind:'eligible',podcast_id:'b',episode_key:'b2'}];
  const result=buildReconciledPlaylistOrder(rows,'b',eligible);
  assert.deepEqual(result.map(row=>row.item_id||row.episode_key),['a1','c1','b1','b2']);
});

test('feed refresh reads persisted preferences and subscriptions before reconciling',()=>{
  assert.match(main,/refreshPreference=query\(`SELECT show_latest_only,oldest_first/);
  assert.match(main,/refreshSubscriptions=query\(`SELECT playlist_id,subscribed/);
  assert.match(main,/buildReconciledPlaylistOrder/);
  assert.match(main,/DELETE FROM podcast_up_next WHERE podcast_id=/);
  assert.match(main,/DELETE FROM podcast_playlist_items WHERE playlist_id=\? AND podcast_id=/);
});
