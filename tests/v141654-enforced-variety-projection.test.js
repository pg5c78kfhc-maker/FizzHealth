import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyPlaylistFilters} from '../src/podcast/playlistFilters.js';

const rows=[
 {id:'s358',podcast_id:'sword'},
 {id:'s357',podcast_id:'sword'},
 {id:'s356',podcast_id:'sword'},
 {id:'b1',podcast_id:'b'},
 {id:'c1',podcast_id:'c'},
 {id:'b2',podcast_id:'b'},
];

test('enforced variety emits at most one episode per podcast per round',()=>{
 const result=applyPlaylistFilters(rows,{enforceMasterOrder:true,enforceVariety:true,masterPodcastIds:['sword','b','c']});
 assert.deepEqual(result.map(row=>row.id),['s358','b1','c1','s357','b2','s356']);
 assert.deepEqual(result.slice(0,3).map(row=>row.podcast_id),['sword','b','c']);
});

test('startup reconciliation reapplies filters to non-empty variety playlists',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(main,/else if\(Number\(row\.enforce_master_order\)===1\|\|Number\(row\.enforce_variety\)===1\)await applyStoredPlaylistFilters\(row\.playlist_id\)/);
});

test('visible playlist projection applies variety defensively at read time',()=>{
 const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.match(main,/grouped\[playlist\.playlist_id\]=applyPlaylistFilters\(list,\{enforceMasterOrder:true,enforceVariety,masterPodcastIds:order\}\)/);
 assert.match(main,/playlistItemsById=useMemo/);
});
