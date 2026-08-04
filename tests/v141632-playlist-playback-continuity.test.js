import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('playlist navigation is a one-row horizontal touch carousel',()=>{
 assert.match(main,/podcast-playlist-carousel/);
 assert.match(main,/podcast-playlist-touch/);
 assert.match(main,/scrollIntoView\(\{behavior:'smooth',block:'nearest',inline:'center'\}\)/);
 assert.match(css,/\.podcast-playlist-carousel\{display:flex/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/flex:0 0 118px/);
});
test('ended event is owned by the persistent audio lifecycle',()=>{
 assert.match(main,/audio\.addEventListener\('ended',ended\)/);
 assert.match(main,/audio\.removeEventListener\('ended',ended\)/);
 assert.match(main,/playbackRef=useRef\(playback\)/);
 assert.doesNotMatch(main,/onEnded=\{/);
});
test('auto advance records route-independent diagnostics and skips invalid queue items',()=>{
 assert.match(main,/operation:'playback-auto-advance'/);
 assert.match(main,/documentVisibility:document\.visibilityState/);
 assert.match(main,/applicationRoute:location\.hash\|\|location\.pathname/);
 assert.match(main,/while\(next&&\(!podcastUrl\(next\.audio_url\)/);
 assert.match(main,/duplicateSuppressed:false/);
});
