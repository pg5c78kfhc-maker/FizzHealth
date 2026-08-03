import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {formatPlaylistRemaining} from '../src/podcast/playlistDuration.js';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('release version is 1.4.16.21',()=>assert.match(source,/const VERSION='1\.4\.16\.21'/));
test('PodcastsPage imports the playlist remaining helper',()=>assert.match(source,/import \{formatPlaylistRemaining\} from '\.\/podcast\/playlistDuration\.js'/));
test('empty and malformed playlists are safe',()=>{
  assert.deepEqual(formatPlaylistRemaining(null,null),{seconds:0,unknown:0,label:'0:00'});
  assert.deepEqual(formatPlaylistRemaining({},{}),{seconds:0,unknown:0,label:'0:00'});
});
test('remaining duration subtracts saved position and counts unknown durations',()=>{
  assert.deepEqual(formatPlaylistRemaining([
    {episode_key:'a',duration_seconds:300,position_seconds:60},
    {episode_key:'b',duration_seconds:0,position_seconds:0},
    {episode_key:'c',duration_seconds:90,status:'played'},
  ],null),{seconds:240,unknown:1,label:'4:00'});
});
test('active playback overrides stale playlist position',()=>{
  assert.deepEqual(formatPlaylistRemaining([
    {episode_key:'a',duration_seconds:300,position_seconds:30},
  ],{episode_key:'a',duration_seconds:300,position_seconds:125}),{seconds:175,unknown:0,label:'2:55'});
});
test('remaining labels support hours and days',()=>{
  assert.equal(formatPlaylistRemaining([{duration_seconds:3661}],null).label,'1:01:01');
  assert.equal(formatPlaylistRemaining([{duration_seconds:90061}],null).label,'1d 01:01:01');
});
