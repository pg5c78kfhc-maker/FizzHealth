import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {formatPlaylistRemaining} from '../src/podcast/playlistDuration.js';
import {shuffleGestureDecision} from '../src/podcast/shuffleEngine.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('release version and disclosure render are updated',()=>{
 assert.match(main,/const VERSION='1\.4\.16\.50'/);
 assert.match(main,/aria-expanded=\{showPlayed\}/);
 assert.match(main,/showPlayed&&playedRows\.length>0&&renderRows\(playedRows/);
});

test('shared swipe requires deliberate horizontal release',()=>{
 assert.equal(shuffleGestureDecision({dx:170,dy:10,cardWidth:400,maxDx:170}).activate,true);
 assert.equal(shuffleGestureDecision({dx:90,dy:5,cardWidth:400,maxDx:90}).activate,false);
 assert.equal(shuffleGestureDecision({dx:150,dy:120,cardWidth:400,maxDx:150}).activate,false);
 assert.match(main,/reverse-movement/);
 assert.match(main,/diagonal-drift/);
});

test('shuffle remaining duration subtracts live playback position',()=>{
 const result=formatPlaylistRemaining([
  {episode_key:'a',duration_seconds:600,position_seconds:0},
  {episode_key:'b',duration_seconds:300,position_seconds:20},
 ],{episode_key:'a',duration_seconds:600,position_seconds:125});
 assert.equal(result.seconds,755);
 assert.equal(result.label,'12:35');
 assert.match(main,/fizz:podcast-live-progress/);
 assert.match(main,/shuffleRemaining\.label/);
});

test('playlist projection preserves per-podcast episode direction',()=>{
 assert.match(main,/COALESCE\(pref\.oldest_first,0\) oldest_first/);
 assert.match(main,/oldestFirst\?at-bt:bt-at/);
 assert.match(main,/podcast-sequence-preserved/);
});
