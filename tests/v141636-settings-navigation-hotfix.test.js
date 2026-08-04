import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('main Settings component exists and is independently declared',()=>{
  assert.match(source,/function Data\(\{refresh,podcastPlayback,setPodcastPlayback,podcastSpeed,setPodcastSpeed\}\)/);
});

test('footer Settings route renders Data inside an error boundary',()=>{
  assert.match(source,/tab==='data'&&<ErrorBoundary label="Settings"><Data[\s\S]*?<\/ErrorBoundary>/);
});

test('Podcasts render switch remains before the Data component',()=>{
  const podcastStart=source.indexOf('function PodcastsPage(');
  const diagnostics=source.indexOf("if(view==='diagnostics')",podcastStart);
  const dataStart=source.indexOf('function Data(',podcastStart);
  assert.ok(podcastStart>=0&&diagnostics>podcastStart&&dataStart>diagnostics);
  assert.match(source.slice(podcastStart,dataStart),/landingTab==='library'/);
  assert.match(source.slice(podcastStart,dataStart),/episode-details/);
});

test('release metadata is v1.4.16.36',()=>{
  assert.match(source,/const VERSION='1\.4\.16\.36'/);
  assert.match(source,/const BUILD_ID='141636'/);
});
