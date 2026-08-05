import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('generic playlist projection is registry and membership driven',()=>{
 assert.match(main,/async function rebuildPodcastPlaylistProjection\(playlistId/);
 assert.match(main,/FROM podcast_playlist_subscriptions s JOIN podcasts p/);
 assert.match(main,/FROM podcast_episodes e JOIN podcasts p/);
 assert.match(main,/DELETE FROM podcast_playlist_items WHERE playlist_id=\?/);
 assert.match(main,/finalProjectedEpisodeCount/);
});
test('membership editors rebuild the selected playlist immediately',()=>{
 assert.match(main,/reason:'podcast-membership-editor'/);
 assert.match(main,/reason:'playlist-podcast-editor'/);
 assert.match(main,/reason:'podcast-settings-membership'/);
});
test('stale custom playlists recover at startup',()=>{
 assert.match(main,/rebuildAllPodcastPlaylistProjections\('v1\.4\.16\.40-startup-recovery'\)/);
 assert.match(main,/Number\(row\.member_count\)>0&&Number\(row\.item_count\)===0/);
});
test('reorder page has right-side handle and edge auto-scroll',()=>{
 assert.match(main,/className="podcast-reorder-handle"/);
 assert.match(main,/requestAnimationFrame\(autoScroll\)/);
 assert.match(main,/scrollRef\.current\.scrollTop\+=delta/);
 assert.match(css,/grid-template-columns:64px minmax\(0,1fr\) 54px/);
});
test('dedicated scroll gutter scrolls without initiating drag',()=>{
 assert.match(main,/className="podcast-reorder-scroll-gutter"/);
 assert.match(main,/gutterRef\.current\.lastY-e\.clientY/);
 assert.match(css,/touch-action:pan-y/);
});
test('release metadata and schema are current',()=>{
 assert.match(main,/const VERSION='1\.4\.16\.40'/);
 assert.match(main,/const BUILD_ID='141640'/);
 assert.match(db,/const TARGET_SCHEMA_VERSION=129/);
 assert.match(db,/version:129,name:'Dynamic Playlist Episode Projection and Reorder Usability'/);
});
