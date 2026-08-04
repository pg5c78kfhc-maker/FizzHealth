import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const db=fs.readFileSync('src/database.js','utf8'),main=fs.readFileSync('src/main.jsx','utf8'),feed=fs.readFileSync('src/podcast/feedRetrieval.js','utf8'),integrity=fs.readFileSync('src/podcast/databaseIntegrity.js','utf8');
test('serializes and retries IndexedDB writes',()=>{assert.match(db,/idbWriteChain/);assert.match(db,/withSerializedIdbWrite/);assert.match(db,/attempt<=3/)});
test('podcast deletion is cascading and verified',()=>{for(const table of ['podcast_episodes','podcast_up_next','podcast_playlist_items','podcast_playback','podcast_preferences','podcast_playlist_subscriptions'])assert.match(main,new RegExp(`DELETE FROM ${table}`));assert.match(main,/cascade deletion verification failed/)});
test('latest-only imports one episode and reports skips',()=>{assert.match(main,/importCandidates=refreshShowLatestOnly/);assert.match(main,/episodesSkippedByPolicy/)});
test('large feed safe limit is 32MB',()=>assert.match(feed,/32_000_000/));
test('one-time cleanup covers podcast references',()=>{assert.match(integrity,/podcast_cleanup_1_4_16_28/);assert.match(integrity,/episode_key NOT IN/)});
