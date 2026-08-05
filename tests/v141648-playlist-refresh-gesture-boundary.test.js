import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');

test('reorder page uses a bounded internal scroll viewport and clamps drops',()=>{
 assert.match(source,/podcast-reorder-bounded-list/);
 assert.match(source,/el\.scrollHeight-el\.clientHeight/);
 assert.match(source,/moveToBoundary\(dragRef\.current\.id,false\)/);
 assert.match(source,/moveToBoundary\(dragRef\.current\.id,true\)/);
 assert.match(source,/requestAnimationFrame\(clampScroll\)/);
 assert.match(css,/\.podcast-reorder-bounded-list\{[^}]*overflow-y:auto!important/);
 assert.match(css,/\.podcast-reorder-page\{[^}]*overflow:hidden!important/);
});

test('episode gestures reset across navigation and details interactions',()=>{
 assert.match(source,/fizz:podcast-gesture-reset/);
 assert.match(source,/gestureToken=useRef\(0\)/);
 assert.match(source,/token===gestureToken\.current/);
 assert.match(source,/setContextMenu\(null\);setPlusMenu\(false\)/);
 assert.match(source,/resetGesture\(\);window\.dispatchEvent\(new CustomEvent\('fizz:podcast-gesture-reset'\)\);onInfo/);
});

test('pull to refresh performs a final full projection then reapplies filters',()=>{
 assert.match(source,/pull-to-refresh-final-projection/);
 assert.match(source,/rebuildPodcastPlaylistProjection\(playlistId,\{reason:'pull-to-refresh-final-projection',forceFull:true\}\);await applyStoredPlaylistFilters\(playlistId\)/);
});

test('played filtering uses playback duration with episode and projection fallbacks',()=>{
 assert.match(source,/NULLIF\(p\.duration_seconds,0\),NULLIF\(i\.duration_seconds,0\),NULLIF\(e\.duration_seconds,0\)/);
 assert.match(source,/NULLIF\(pb\.duration_seconds,0\),NULLIF\(e\.duration_seconds,0\)/);
 assert.match(source,/pb\.completed_at IS NULL/);
 assert.match(source,/COALESCE\(pb\.status,'unplayed'\)<>'played'/);
});

test('release metadata is v1.4.16.48',()=>{
 assert.match(source,/const VERSION='1\.4\.16\.48'/);
 assert.match(source,/const BUILD_ID='141648'/);
});
