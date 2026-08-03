import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Find Podcasts uses an active subscription toggle',()=>{
  assert.match(main,/toggleDirectoryPodcast/);
  assert.match(main,/Subscribed/);
  assert.match(main,/Subscribe/);
  assert.doesNotMatch(main,/disabled=\{added\|\|addingId===id\}/);
});

test('unsubscribe preserves history while removing active playlist entries',()=>{
  assert.match(main,/UPDATE podcasts SET active=0/);
  assert.match(main,/DELETE FROM podcast_up_next WHERE podcast_id/);
  assert.match(main,/DELETE FROM podcast_playlist_items WHERE podcast_id/);
  assert.doesNotMatch(main,/DELETE FROM podcast_playback WHERE podcast_id/);
  assert.doesNotMatch(main,/DELETE FROM podcast_preferences WHERE podcast_id/);
});

test('subscribe and resubscribe refresh metadata immediately',()=>{
  assert.match(main,/active=1,metadata_incomplete=1/);
  assert.match(main,/loadEpisodes\(subscribedPodcast,\{silent:true\}\)/);
  assert.match(main,/metadata_last_attempt_at/);
});

test('metadata completeness is persisted and failures remain retryable',()=>{
  assert.match(main,/metadataIncomplete=!/);
  assert.match(main,/UPDATE podcasts SET metadata_incomplete=\?/);
  assert.match(main,/metadata_incomplete=1,feed_health_status='error'/);
});

test('library refresh prioritizes incomplete metadata records',()=>{
  assert.match(main,/ORDER BY COALESCE\(metadata_incomplete,1\) DESC/);
});

test('schema 122 adds metadata repair fields',()=>{
  assert.match(db,/TARGET_SCHEMA_VERSION=122/);
  assert.match(db,/version:122,name:'Podcast Subscription Lifecycle and Metadata Repair'/);
  assert.match(db,/ADD COLUMN metadata_incomplete/);
  assert.match(db,/ADD COLUMN metadata_last_attempt_at/);
});
