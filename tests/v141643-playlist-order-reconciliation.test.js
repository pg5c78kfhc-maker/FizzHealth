import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const db=fs.readFileSync('src/database.js','utf8');

test('v1.4.16.43 metadata and migration are current',()=>{
 assert.match(main,/const VERSION='1\.4\.16\.43'/);
 assert.match(main,/const BUILD_ID='141643'/);
 assert.match(db,/version:131,name:'Playlist Ordering and Live Reconciliation Repair'/);
});
test('Podcast Settings exposes playlist reordering beneath creation',()=>{
 const settings=main.slice(main.indexOf("if(view==='global-settings')"));
 const create=settings.indexOf('Create Playlist');
 const reorder=settings.indexOf('Reorder Playlists');
 assert.ok(create>0&&reorder>create);
 assert.match(main,/setView\('playlist-carousel-reorder'\)/);
});
test('playlist order save commits, verifies and refreshes registry',()=>{
 assert.match(main,/operation:'podcast-playlist-carousel-order'/);
 assert.match(main,/Playlist order verification failed/);
 assert.match(main,/operation:'reordered',playlistIds:verified,verified:true/);
});
test('played exclusion is universal and includes completion threshold',()=>{
 assert.match(main,/pb\.completed_at IS NULL/);
 assert.match(main,/position_seconds,0\)>=COALESCE\(pb\.duration_seconds,0\)\*0\.95/);
 assert.match(main,/fizz:podcast-playback-updated/);
});
test('membership changes trigger verified live reconciliation',()=>{
 assert.match(main,/Playlist membership verification failed/);
 assert.match(main,/fizz:podcast-membership-updated/);
});
test('reorder page no longer uses a visible scroll overlay',()=>{
 assert.match(css,/\.podcast-reorder-scroll-shell,\.podcast-reorder-scroll-gutter\{display:none!important\}/);
 assert.match(main,/podcast-reorder-document-list/);
});
test('refresh timestamps use local human-readable formatting',()=>{
 assert.match(main,/function podcastDateTime/);
 assert.match(main,/Last successful refresh',podcastDateTime/);
});
