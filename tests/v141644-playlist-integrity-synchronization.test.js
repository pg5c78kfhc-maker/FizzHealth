import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('release metadata is v1.4.16.44 and schema migration 132 exists',()=>{
 assert.equal(pkg.version,'1.4.16.44');
 assert.match(main,/const VERSION='1\.4\.16\.44'/);
 assert.match(main,/const BUILD_ID='141644'/);
 assert.match(database,/version:132,name:'Playlist Integrity and Synchronization'/);
});

test('membership reconciliation uses stable podcast and playlist IDs',()=>{
 assert.match(main,/reconcilePodcastPlaylistMembership\(\{podcastId,playlistId,enabled/);
 assert.match(main,/WHERE podcast_id=\? AND playlist_id=\?/);
 assert.doesNotMatch(main,/WHERE LOWER\(p?\.?title\).*playlist/i);
});

test('removal deletes stale projection and ordering rows by stable IDs',()=>{
 assert.match(main,/DELETE FROM podcast_playlist_items WHERE playlist_id=\? AND podcast_id=\?/);
 assert.match(main,/DELETE FROM podcast_playlist_podcast_order WHERE playlist_id=\? AND podcast_id=\?/);
});

test('renamed legacy Up Next no longer renders from podcast_up_next',()=>{
 assert.match(main,/const upNext=useMemo\(\(\)=>playlistItemsById\['up-next'\]\|\|\[\]/);
 assert.match(main,/DELETE FROM podcast_up_next WHERE podcast_id=\?/);
 assert.match(database,/DELETE FROM podcast_up_next WHERE NOT EXISTS/);
});

test('membership checklists reload verified database state after each toggle',()=>{
 assert.match(main,/const verifiedMembers=new Set\(optionalQuery\(`SELECT playlist_id FROM podcast_playlist_subscriptions/);
 assert.match(main,/const verifiedMembers=new Set\(optionalQuery\(`SELECT podcast_id FROM podcast_playlist_subscriptions/);
});

test('startup reconciliation removes projections without active memberships',()=>{
 assert.match(main,/reconcileAllPodcastPlaylistMemberships\('v1\.4\.16\.44-startup-reconciliation'\)/);
 assert.match(main,/DELETE FROM podcast_playlist_items WHERE NOT EXISTS/);
 assert.match(main,/podcast_playlist_reconciliation_audit/);
});
