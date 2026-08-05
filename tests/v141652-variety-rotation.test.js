import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reconcileRotationOrder,rotatePodcastToEnd} from '../src/podcast/varietyRotation.js';
import {applyPlaylistFilters} from '../src/podcast/playlistFilters.js';

test('initial rotation follows master order and appends newly eligible podcasts',()=>{
  assert.deepEqual(reconcileRotationOrder({storedPodcastIds:[],eligiblePodcastIds:['c','a','b'],masterPodcastIds:['a','b','c']}),['a','b','c']);
  assert.deepEqual(reconcileRotationOrder({storedPodcastIds:['b','a'],eligiblePodcastIds:['a','b','c'],masterPodcastIds:['a','b','c']}),['b','a','c']);
});

test('completed podcast moves to end of current rotation',()=>{
  assert.deepEqual(rotatePodcastToEnd(['a','b','c'],'a'),['b','c','a']);
  assert.deepEqual(rotatePodcastToEnd(['b','c','a'],'b'),['c','a','b']);
  assert.deepEqual(rotatePodcastToEnd(['c','a','b'],'c'),['a','b','c']);
});

test('variety interleaving uses persisted live rotation',()=>{
  const rows=[
    {id:'a1',podcast_id:'a'},{id:'a2',podcast_id:'a'},
    {id:'b1',podcast_id:'b'},{id:'b2',podcast_id:'b'},
    {id:'c1',podcast_id:'c'},{id:'c2',podcast_id:'c'}
  ];
  const result=applyPlaylistFilters(rows,{enforceMasterOrder:true,enforceVariety:true,masterPodcastIds:['b','c','a']});
  assert.deepEqual(result.map(row=>row.id),['b1','c1','a1','b2','c2','a2']);
});

test('source wires natural completion, manual played, persistence, and schema migration',()=>{
  const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
  assert.match(main,/fizz:podcast-variety-completed/);
  assert.match(main,/rotateVarietyPlaylistPodcast\(playlistId,item\.podcast_id,'manual-mark-played'\)/);
  assert.match(main,/podcast_playlist_variety_rotation/);
  assert.match(main,/activeRotationOrder:effectivePodcastOrder/);
  assert.match(db,/TARGET_SCHEMA_VERSION=134/);
  assert.match(db,/Variety Rotation Unification/);
});
