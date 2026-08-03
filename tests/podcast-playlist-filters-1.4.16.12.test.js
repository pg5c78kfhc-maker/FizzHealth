import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPlaylistFilters} from '../src/podcast/playlistFilters.js';

test('master order groups podcasts according to My Podcasts',()=>{
 const rows=[{podcast_id:'b',id:'b1'},{podcast_id:'a',id:'a1'},{podcast_id:'b',id:'b2'}];
 assert.deepEqual(applyPlaylistFilters(rows,{enforceMasterOrder:true,masterPodcastIds:['a','b']}).map(x=>x.id),['a1','b1','b2']);
});
test('variety round robins podcast episodes',()=>{
 const rows=[{podcast_id:'a',id:'a1'},{podcast_id:'a',id:'a2'},{podcast_id:'a',id:'a3'},{podcast_id:'b',id:'b1'},{podcast_id:'b',id:'b2'}];
 assert.deepEqual(applyPlaylistFilters(rows,{enforceMasterOrder:true,enforceVariety:true,masterPodcastIds:['a','b']}).map(x=>x.id),['a1','b1','a2','b2','a3']);
});
test('unchecked filters preserve current order',()=>{
 const rows=[{podcast_id:'b',id:'b1'},{podcast_id:'a',id:'a1'}];
 assert.deepEqual(applyPlaylistFilters(rows,{}).map(x=>x.id),['b1','a1']);
});
