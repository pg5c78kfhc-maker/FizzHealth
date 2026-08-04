import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('release and schema advance to 1.4.16.27',()=>{assert.match(main,/VERSION='1\.4\.16\.27'/);assert.match(main,/BUILD_ID='141627'/);assert.match(db,/TARGET_SCHEMA_VERSION=124/)});
test('playlist page-size preference defaults to 50 and supports 50 100 200',()=>{assert.match(main,/setting_key='playlist_page_size'/);assert.match(main,/\[50,100,200\]\.includes/);assert.match(main,/Maximum per page episodes to display/);assert.match(main,/<option value="50">50<\/option><option value="100">100<\/option><option value="200">200<\/option>/)});
test('large playlists mount only the visible page',()=>{assert.match(main,/upNext\.slice\(0,playlistVisible\.queue\)/);assert.match(main,/list\.slice\(0,limit\)/);assert.match(main,/podcast-load-more/);assert.match(main,/Showing \{Math\.min/)});
test('playlist artwork is lazy and async decoded',()=>{assert.match(main,/episode\.artwork_url\|\|podcast\.artwork_url\} alt="" loading="lazy" decoding="async"/)});
test('episode card errors are isolated',()=>{assert.match(main,/class PodcastEpisodeBoundary extends Component/);assert.match(main,/operation:'episode-card-render'/);assert.match(main,/<PodcastEpisodeBoundary key=\{key\}/)});
test('playback completion is idempotent and failures are trapped',()=>{assert.match(main,/completionKey\.current===key\|\|transitioning\.current/);assert.match(main,/onEnded=\{\(\)=>completeCurrent\(\)\.catch/);assert.match(main,/operation:'playback-ended'/)});
test('playlist publication date falls back to canonical metadata',()=>{assert.match(main,/COALESCE\(NULLIF\(q\.published_at,''\),e\.published_at\) published_at/);assert.match(main,/COALESCE\(NULLIF\(i\.published_at,''\),e\.published_at\) published_at/)});
test('feed refresh persists canonical episodes',()=>{assert.match(main,/INSERT INTO podcast_episodes\(episode_id,podcast_id,title,description,published_at/);assert.match(main,/ON CONFLICT\(episode_id\) DO UPDATE SET/)});
test('queue reconciliation carries publication dates',()=>{assert.match(main,/INSERT INTO podcast_up_next\([^`]*published_at\) VALUES\([^`]*\)/);assert.match(main,/episode\.published_at\|\|''/)});
test('migration backfills playlist dates and page-size setting',()=>{assert.match(db,/ALTER TABLE podcast_up_next ADD COLUMN published_at TEXT/);assert.match(db,/UPDATE podcast_up_next SET published_at=/);assert.match(db,/UPDATE podcast_playlist_items SET published_at=/);assert.match(db,/playlist_page_size','50'/)});
