import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildShuffleQueue,rotateShuffleSources} from '../src/podcast/shuffleEngine.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('consecutive completions persist each contributor at the bottom',()=>{
 let order=['news','politics','stories','drama'];
 order=rotateShuffleSources(order,['news']);
 assert.deepEqual(order,['politics','stories','drama','news']);
 order=rotateShuffleSources(order,['politics']);
 assert.deepEqual(order,['stories','drama','news','politics']);
 order=rotateShuffleSources(order,['stories']);
 assert.deepEqual(order,['drama','news','politics','stories']);
});

test('replacement projection follows persisted rotation order',()=>{
 const items={
  news:[{episode_key:'news-2'}], politics:[{episode_key:'politics-2'}],
  stories:[{episode_key:'stories-2'}], drama:[{episode_key:'drama-2'}],
 };
 const order=rotateShuffleSources(['news','politics','stories','drama'],['news']);
 assert.deepEqual(buildShuffleQueue({sourcePlaylistIds:order,itemsByPlaylist:items}).queue.map(x=>x.primary_playlist_id),['politics','stories','drama','news']);
});

test('duplicate contributors rotate together without duplicating the card',()=>{
 const order=rotateShuffleSources(['news','politics','stories'],['news','stories']);
 assert.deepEqual(order,['politics','news','stories']);
 const result=buildShuffleQueue({sourcePlaylistIds:order,itemsByPlaylist:{politics:[{episode_key:'p2'}],news:[{episode_key:'shared'}],stories:[{episode_key:'shared'}]}});
 assert.deepEqual(result.queue.map(x=>x.episode_key),['p2','shared']);
 assert.deepEqual(result.queue[1].contributing_playlist_ids,['news','stories']);
});

test('automatic Shuffle completion emits stable contributor IDs and refreshes rotation state',()=>{
 assert.match(main,/const VERSION='1\.4\.16\.51'/);
 assert.match(main,/fizz:podcast-shuffle-completed/);
 assert.match(main,/contributingPlaylistIds:contributorIds/);
 assert.match(main,/rotateShuffleContributors\(ids\)/);
 assert.match(main,/setTick\(value=>value\+1\);setQueueRevision\(value=>value\+1\)/);
});
