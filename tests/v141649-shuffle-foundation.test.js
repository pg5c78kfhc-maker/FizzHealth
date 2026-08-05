import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildShuffleQueue,rotateShuffleSources,eligibleShuffleSources,shuffleGestureDecision} from '../src/podcast/shuffleEngine.js';

test('shuffle contributes one current episode per selected stable playlist ID and suppresses duplicates',()=>{
 const result=buildShuffleQueue({sourcePlaylistIds:['news','politics','stories'],itemsByPlaylist:{news:[{episode_key:'e1'}],politics:[{episode_key:'e2'}],stories:[{episode_key:'e1'}]}});
 assert.deepEqual(result.queue.map(x=>x.episode_key),['e1','e2']);
 assert.deepEqual(result.queue[0].contributing_playlist_ids,['news','stories']);
});

test('completed contributors rotate to the end',()=>assert.deepEqual(rotateShuffleSources(['news','politics','stories'],['news']),['politics','stories','news']));

test('system and non-playlist containers cannot be selected',()=>assert.deepEqual(eligibleShuffleSources([{playlist_id:'shuffle'},{playlist_id:'library'},{playlist_id:'unassigned'},{playlist_id:'news'}]).map(x=>x.playlist_id),['news']));

test('strict release gesture cancels diagonal, scroll and reversal',()=>{
 assert.equal(shuffleGestureDecision({dx:180,dy:150,cardWidth:320,maxDx:180}).activate,false);
 assert.equal(shuffleGestureDecision({dx:180,dy:10,cardWidth:320,maxDx:220,reversed:true}).reason,'reverse-movement');
 assert.equal(shuffleGestureDecision({dx:180,dy:10,cardWidth:320,maxDx:180,scrolling:true}).reason,'scrolling');
 assert.equal(shuffleGestureDecision({dx:180,dy:10,cardWidth:320,maxDx:180}).activate,true);
});

test('release source includes permanent shuffle section, settings and diagnostics',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
 assert.match(main,/Shuffle \(\{shuffleItems\.length\}\)/);
 assert.match(main,/view==='shuffle-settings'/);
 assert.match(main,/contributing_playlist_ids/);
 assert.match(main,/fizz:podcast-shuffle-diagnostic/);
 assert.match(db,/podcast_shuffle_sources/);
 assert.match(db,/1\.4\.16\.49/);
});
