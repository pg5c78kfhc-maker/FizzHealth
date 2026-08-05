import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rotateShuffleSources,buildShuffleQueue} from '../src/podcast/shuffleEngine.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');

test('release version advances to 1.4.16.53',()=>{
 assert.match(source,/const VERSION='1\.4\.16\.53'/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,'1.4.16.53');
});

test('Shuffle completion is awaited inside the mini-player transaction',()=>{
 assert.match(source,/await completeShufflePlaybackRotation\(\{episodeKey:key,contributingPlaylistIds:contributorIds,source\}\)/);
 assert.doesNotMatch(source,/dispatchEvent\(new CustomEvent\('fizz:podcast-shuffle-completed'/);
});

test('live completion rebuilds source projections before choosing next',()=>{
 const helper=source.slice(source.indexOf('async function completeShufflePlaybackRotation'),source.indexOf('function PodcastMiniPlayer'));
 assert.match(helper,/await rebuildPodcastPlaylistProjection\(playlistId/);
 assert.match(helper,/await applyStoredPlaylistFilters\(playlistId\)/);
 assert.ok(helper.indexOf('await rebuildPodcastPlaylistProjection')<helper.indexOf('currentShuffleQueueSnapshot()'));
 assert.match(helper,/const snapshot=currentShuffleQueueSnapshot\(\),next=snapshot\.queue\[0\]\|\|null/);
});

test('player loads refreshed Shuffle item rather than stale pre-completion adjacency',()=>{
 assert.match(source,/if\(current\?\.playback_source!=='shuffle'\)\{currentQueueItem=queueItem/);
 assert.match(source,/loadQueued\(\{\.\.\.next,playback_source:current\?\.playback_source==='shuffle'\?'shuffle'/);
});

test('three consecutive Shuffle rounds append completed contributor to bottom',()=>{
 let order=['news','politics','stories','drama'];
 order=rotateShuffleSources(order,['news']);
 assert.deepEqual(order,['politics','stories','drama','news']);
 order=rotateShuffleSources(order,['politics']);
 assert.deepEqual(order,['stories','drama','news','politics']);
 order=rotateShuffleSources(order,['stories']);
 assert.deepEqual(order,['drama','news','politics','stories']);
});

test('fresh queue follows rotated source order and contributes one episode per source',()=>{
 const items={
  news:[{episode_key:'n2'}],politics:[{episode_key:'p1'}],stories:[{episode_key:'s1'}]
 };
 const result=buildShuffleQueue({sourcePlaylistIds:['politics','stories','news'],itemsByPlaylist:items});
 assert.deepEqual(result.queue.map(x=>x.episode_key),['p1','s1','n2']);
});
