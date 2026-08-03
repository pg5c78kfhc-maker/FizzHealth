import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const card=source.slice(source.indexOf('function PodcastEpisodeCard'),source.indexOf('function PodcastEpisodeDetails'));

test('release version is 1.4.16.22',()=>assert.match(source,/const VERSION='1\.4\.16\.22'/));
test('shared episode card owns the play or resume tap',()=>{
  assert.match(card,/role=\"button\"/);
  assert.match(card,/onClick=\{play\}/);
  assert.match(card,/onPlay\?\.\(\)/);
});
test('information icon is a distinct right-side action',()=>{
  assert.match(card,/className=\"podcast-episode-info\"/);
  assert.match(card,/onInfo\?\.\(\)/);
  assert.match(card,/stopPropagation\(\)/);
  assert.match(card,/<Info aria-hidden=\"true\"\/>/);
});
test('swipe right marks played without launching playback',()=>{
  assert.match(card,/delta>70/);
  assert.match(card,/swiped\.current=true/);
  assert.match(card,/onMarkPlayed\?\.\(\)/);
});
test('all playlist and episode-list cards reserve a visible info column',()=>{
  assert.match(styles,/\.podcast-up-next>article\.podcast-shared-episode-card,[\s\S]*grid-template-columns:32px 58px minmax\(0,1fr\) 44px/);
  assert.match(styles,/\.podcast-episode-list>article\.podcast-shared-episode-card/);
  assert.match(styles,/\.podcast-shared-episode-card \.podcast-episode-info\{[\s\S]*border-radius:50%/);
});
test('available episodes and all playlists use PodcastEpisodeCard',()=>{
  assert.match(source,/PodcastEpisodeRows[\s\S]*<PodcastEpisodeCard/);
  assert.match(source,/const playlistCard=.*<PodcastEpisodeCard/);
  assert.match(source,/landingTab==='queue'[\s\S]*playlistCard\(item,index/);
  assert.match(source,/landingTab==='stories'\?stories:drama/);
});
