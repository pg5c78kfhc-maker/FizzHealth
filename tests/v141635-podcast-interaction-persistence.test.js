import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('episode taps dispatch a synchronous native play request',()=>{
 assert.match(source,/fizz:podcast-play-request/);
 assert.match(source,/audio\.src=source;audio\.playbackRate=.*?audio\.load\(\);let promise;try\{promise=audio\.play\(\);setPlayback\(next\)/s);
 assert.match(source,/navigator\.userActivation\?\.isActive/);
 assert.match(source,/playbackStartResult:'REJECTED'/);
});

test('persistent audio element remains mounted without active playback',()=>{
 assert.match(source,/<PodcastMiniPlayer playback=\{podcastPlayback\}/);
 assert.doesNotMatch(source,/\{podcastPlayback&&<PodcastMiniPlayer/);
 assert.match(source,/style=\{playback\?undefined:\{display:'none'\}\}/);
});

test('episode information uses the global podcast header and a local boundary',()=>{
 assert.match(source,/function PodcastEpisodeDetails[\s\S]*?<PodcastPageHeader title="Episode Details"/);
 assert.match(source,/class PodcastEpisodeDetailsBoundary/);
 assert.match(source,/Couldn’t open episode details/);
 assert.doesNotMatch(source,/function PodcastEpisodeDetails[\s\S]{0,2500}<Head title="Episode Details"/);
});

test('episode import resolves cross-podcast primary-key collisions',()=>{
 assert.match(source,/resolveEpisodeIdentity=episode/);
 assert.match(source,/collision&&collision\.podcast_id!==podcast\.podcast_id\?`\$\{podcast\.podcast_id\}::\$\{rawKey\}`/);
 assert.match(source,/existingByEnclosure/);
});

test('insert accounting is replaced by post-commit verified inserts',()=>{
 assert.match(source,/podcast-episode-post-commit-verification/);
 assert.match(source,/verifiedInserted=/);
 assert.match(source,/inserted=verifiedInserted/);
 assert.match(source,/missingEpisodeRecords/);
});

test('release metadata is v1.4.16.35',()=>{
 assert.match(source,/const VERSION='1\.4\.16\.35'/);
 assert.match(source,/const BUILD_ID='141635'/);
});
