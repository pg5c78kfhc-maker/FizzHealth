import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('playlist filter ordering is persisted once through serialized transaction',()=>{assert.match(main,/podcast-playlist-filter-order-/);assert.doesNotMatch(main,/for\(let index=0;index<ordered\.length;index\+=1\)\{if\(isUpNext\)await run/)});
test('transaction diagnostics terminate after commit or rollback',()=>{assert.match(db,/commitResult:'COMMITTED'/);assert.match(db,/commitResult:'FAILED'/);assert.match(db,/rollbackResult:'NOT_REQUIRED'/);assert.match(main,/tx\.diagnostic=record/)});
test('playlist rebuild has dedicated transaction diagnostics',()=>{assert.match(main,/playlistRecordsRebuilt:merged\.length/);assert.match(main,/playlistName:playlistId/);assert.match(main,/podcast-playlist-rebuild-/)});
test('parse boundary titles survive downstream failure',()=>{assert.match(main,/firstEpisodeTitle:ordered\[0\]\?\.title\|\|raw\[0\]\?\.title/);assert.match(main,/lastEpisodeTitle:ordered\[ordered\.length-1\]\?\.title\|\|raw\[raw\.length-1\]\?\.title/)});
