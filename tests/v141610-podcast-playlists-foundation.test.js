import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),db=fs.readFileSync('src/database.js','utf8'),pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
test('release metadata is 1.4.16.10',()=>{assert.equal(pkg.version,'1.4.16.10');assert.match(main,/VERSION='1\.4\.16\.10'/);assert.match(main,/BUILD_ID='141610'/)});
test('migration creates generalized playlist storage',()=>{assert.match(db,/version:115/);assert.match(db,/CREATE TABLE IF NOT EXISTS podcast_playlists/);assert.match(db,/podcast_playlist_subscriptions/);assert.match(db,/podcast_playlist_items/)});
test('built-in playlists are seeded',()=>{assert.match(db,/'up-next','Up Next',1/);assert.match(db,/'stories','Stories',0/)});
test('Stories is a third folder tab',()=>{assert.match(main,/landingTab==='stories'/);assert.match(main,/>Stories\{stories\.length/)});
test('podcast settings expose both playlist subscriptions',()=>{assert.match(main,/savePlaylistSubscription\('up-next'/);assert.match(main,/savePlaylistSubscription\('stories'/);assert.match(main,/<h3>Playlists<\/h3>/)});
test('feed refresh populates Stories without duplicates',()=>{assert.match(main,/INSERT OR IGNORE INTO podcast_playlist_items/);assert.match(main,/playlistSubscriptions\.stories/);assert.match(db,/UNIQUE\(playlist_id,episode_key\)/)});
test('Stories remains non-autoplay',()=>{assert.match(db,/'stories','Stories',0/);assert.doesNotMatch(main,/podcast-stories[\s\S]{0,500}playQueued/)});
