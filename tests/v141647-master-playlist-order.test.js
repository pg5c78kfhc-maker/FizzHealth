import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPlaylistFilters} from '../src/podcast/playlistFilters.js';

const rows=[
 {item_id:'a1',podcast_id:'a',episode_title:'A newest'},
 {item_id:'a2',podcast_id:'a',episode_title:'A older'},
 {item_id:'b1',podcast_id:'b',episode_title:'B newest'},
 {item_id:'b2',podcast_id:'b',episode_title:'B older'},
 {item_id:'c1',podcast_id:'c',episode_title:'C newest'},
];

test('master order is primary without variety',()=>{
 const result=applyPlaylistFilters(rows,{enforceMasterOrder:true,enforceVariety:false,masterPodcastIds:['c','a','b']});
 assert.deepEqual(result.map(row=>row.item_id),['c1','a1','a2','b1','b2']);
});

test('variety preserves master order on every round',()=>{
 const result=applyPlaylistFilters(rows,{enforceMasterOrder:true,enforceVariety:true,masterPodcastIds:['c','a','b']});
 assert.deepEqual(result.map(row=>row.item_id),['c1','a1','b1','a2','b2']);
});

test('renames cannot affect stable ID order',()=>{
 const renamed=rows.map(row=>({...row,podcast_title:`Renamed ${row.podcast_id}`}));
 const result=applyPlaylistFilters(renamed,{enforceMasterOrder:true,enforceVariety:true,masterPodcastIds:['b','c','a']});
 assert.deepEqual(result.map(row=>row.podcast_id),['b','c','a','b','a']);
});

test('release source uses playlist-specific saved order and verifies projection',async()=>{
 const source=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/main.jsx',import.meta.url),'utf8'));
 assert.match(source,/FROM podcast_playlist_subscriptions s[\s\S]*LEFT JOIN podcast_playlist_podcast_order o/);
 assert.match(source,/savedPodcastOrder:playlistMasterIds/);
 assert.match(source,/Master playlist order verification failed/);
 assert.match(source,/const VERSION='1\.4\.16\.47'/);
});
