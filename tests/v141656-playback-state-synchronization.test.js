import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('release is v1.4.16.56',()=>{
 assert.match(source,/const VERSION='1\.4\.16\.56'/);
});

test('live audio progress is broadcast to shared episode cards',()=>{
 assert.match(source,/fizz:podcast-live-progress/);
 assert.match(source,/setLiveProgress\(d>0\?Math\.min\(100,p\/d\*100\):0\)/);
 assert.match(source,/effectiveProgress=liveProgress==null\?progress:liveProgress/);
});

test('duration tolerance finalizes through the shared completion transaction',()=>{
 assert.match(source,/const tolerance=effectiveDuration>0\?Math\.max\(\.35,Math\.min\(1\.5,effectiveDuration\*\.01\)\):0/);
 assert.match(source,/completeCurrent\('duration-tolerance'\)/);
 assert.match(source,/completionKey\.current===key/);
});

test('completion persists the playback snapshot captured by the completion handler',()=>{
 assert.match(source,/persist\('played',\{suppressState:true,playback:current\}\)/);
 assert.match(source,/const target=options\.playback\|\|playbackRef\.current\|\|playback/);
});

test('recovery snapshots are persisted from live progress and database persistence',()=>{
 const matches=source.match(/fizz-podcast-playback-recovery-v1/g)||[];
 assert.ok(matches.length>=2);
});

test('ended and tolerance signals converge on completeCurrent',()=>{
 assert.match(source,/completeCurrent\('audio-ended'\)/);
 assert.match(source,/completeCurrent\('duration-tolerance'\)/);
});
