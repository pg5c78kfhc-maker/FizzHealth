import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('playlist filter helper is shared outside PodcastsPage',()=>{
 const helper=main.indexOf('async function applyStoredPlaylistFilters(playlistId)');
 const page=main.indexOf('function PodcastsPage(');
 assert.ok(helper>0 && helper<page);
 assert.equal(main.includes('const applyStoredPlaylistFilters=async playlistId=>'),false);
});

test('reorder save rebuild can resolve shared helper at runtime',()=>{
 const rebuild=main.indexOf('async function rebuildPodcastPlaylistProjection');
 const call=main.indexOf('await applyStoredPlaylistFilters(playlistId)',rebuild);
 assert.ok(call>rebuild);
});

test('mark played swipe requires deliberate horizontal travel and release',()=>{
 assert.match(main,/threshold=Math\.max\(130,state\.cardWidth\*0\.35\)/);
 assert.match(main,/state\.axis==='horizontal'/);
 assert.match(main,/releasedArmed=state\.armed/);
 assert.match(main,/dx>=state\.maxDx-20/);
});

test('vertical or cancelled gestures cannot mark played',()=>{
 assert.match(main,/state\.axis='vertical';state\.cancelled=true/);
 assert.match(main,/state\.cancelled\|\|state\.axis!=='horizontal'/);
});
