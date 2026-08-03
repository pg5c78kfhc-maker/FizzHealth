import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),api=fs.readFileSync('functions/api/podcast-feed.js','utf8'),db=fs.readFileSync('src/database.js','utf8'),css=fs.readFileSync('src/styles.css','utf8');
test('feed endpoint returns channel metadata',()=>{assert.match(api,/metadata=\{title:/);assert.match(api,/publisher:/);assert.match(api,/artwork_url:/);assert.match(api,/Response\.json\(\{episodes,metadata\}/)});
test('feed metadata persists to podcasts',()=>{assert.match(main,/publisher=COALESCE\(NULLIF/);assert.match(main,/feed_health_status='healthy'/);assert.match(db,/feed_health_status TEXT/)});
test('refresh uses adaptive contrast progress bar',()=>{assert.match(main,/podcast-refresh-progress/);assert.match(css,/clip-path:inset/);assert.match(css,/--refresh-progress/)});
test('mini player exposes sleep timer options',()=>{for(const label of ['Stop at End of Episode','Stop After 15 Minutes','Stop After 30 Minutes'])assert.ok(main.includes(label));assert.match(main,/Clock3/)});
test('playlist cards are shared and omit queue remove button',()=>{assert.match(main,/const playlistCard=/);assert.ok(!main.includes('className="podcast-queue-remove"'))});
test('swipe marks episode played and completes position',()=>{assert.match(main,/markPlaylistEpisodePlayed/);assert.match(main,/position_seconds=excluded.position_seconds,status='played'/);assert.match(main,/changedTouches\[0\]\.clientX-start>70/)});
test('playlist pull refresh is scoped to represented podcasts',()=>{assert.match(main,/refreshCurrentPlaylist/);assert.match(main,/onlyPlaylist:playlistId/);assert.match(main,/source\.map\(item=>item\.podcast_id\)/)});
