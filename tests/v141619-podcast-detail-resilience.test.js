import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizePodcastRecord,podcastList,podcastText,podcastUrl} from '../src/podcast/metadata.js';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('podcast metadata accepts Mike-style non-string category values',()=>{
  assert.deepEqual(podcastList(['Comedy',{name:'News'},null]),['Comedy','News']);
  assert.deepEqual(podcastList({Comedy:true,Daily:false,Drama:1}),['Comedy','Drama']);
  assert.deepEqual(podcastList('["Comedy","Talk"]'),['Comedy','Talk']);
});

test('podcast text fields never expose objects to React',()=>{
  assert.equal(podcastText({name:'The Mike O’Meara Show'}),'The Mike O’Meara Show');
  assert.equal(podcastText(null),'');
  assert.equal(typeof podcastText({unexpected:{nested:true}}),'string');
});

test('unsafe and malformed URLs are suppressed',()=>{
  assert.equal(podcastUrl('javascript:alert(1)'),'');
  assert.equal(podcastUrl({href:'https://example.com'}),'');
  assert.equal(podcastUrl('https://example.com/feed'),'https://example.com/feed');
});

test('normalization produces render-safe podcast detail fields',()=>{
  const row=normalizePodcastRecord({
    title:{name:'The Mike O’Meara Show'},
    publisher:{label:'Mike O’Meara'},
    description:{text:'Daily show'},
    categories:[{name:'Comedy'},'Talk'],
    website_url:'not a url'
  });
  assert.equal(row.title,'The Mike O’Meara Show');
  assert.equal(row.publisher,'Mike O’Meara');
  assert.equal(row.description,'Daily show');
  assert.deepEqual(row.categories,['Comedy','Talk']);
  assert.equal(row.website_url,'');
});

test('podcast detail uses normalized categories and has a render error boundary',()=>{
  assert.match(source,/\.map\(normalizePodcastRecord\)/);
  assert.match(source,/podcastList\(selected\.categories\)/);
  assert.doesNotMatch(source,/selected\.categories\.split\(/);
  assert.match(source,/class PodcastPageBoundary extends Component/);
  assert.match(source,/This podcast couldn’t be displayed/);
});
