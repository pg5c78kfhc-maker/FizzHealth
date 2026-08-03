import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePodcastFeed,retrievePodcastFeed} from '../src/podcast/feedRetrieval.js';

const xml=`<?xml version="1.0"?><rss><channel><title>Relic Test</title><item><title>Episode One</title><guid>one</guid><pubDate>Mon, 03 Aug 2026 12:00:00 GMT</pubDate><itunes:duration>1:02:03</itunes:duration><enclosure url="http://media.example.com/one.mp3" type="audio/mpeg"/></item></channel></rss>`;
const response=(body,{status=200,type='application/json'}={})=>({ok:status>=200&&status<300,status,headers:{get:key=>key.toLowerCase()==='content-type'?type:''},text:async()=>body,json:async()=>JSON.parse(body)});

test('proxy may return raw XML and parsing stays on the phone',async()=>{
 const calls=[];
 const result=await retrievePodcastFeed({feedUrl:'https://feed.example.com/rss',storage:null,fetchImpl:async url=>{
  calls.push(String(url));
  if(calls.length===1)throw new TypeError('Load failed');
  return response(JSON.stringify({xml,finalUrl:'https://feed.example.com/rss'}));
 }});
 assert.equal(result.retrieval.mode,'proxy');
 assert.equal(result.metadata.title,'Relic Test');
 assert.equal(result.episodes.length,1);
});

test('HTTP feeds skip unsafe browser fetch and go straight to compatibility mode',async()=>{
 const calls=[];
 const result=await retrievePodcastFeed({feedUrl:'http://feeds.example.com/rss',storage:null,fetchImpl:async url=>{
  calls.push(String(url));
  return response(JSON.stringify({xml,finalUrl:'https://feeds.example.com/rss'}));
 }});
 assert.equal(calls.length,1);
 assert.match(calls[0],/^\/api\/podcast-feed\?/);
 assert.equal(result.retrieval.mode,'proxy');
});

test('legacy HTTP enclosure URLs are upgraded for secure playback',()=>{
 const result=parsePodcastFeed(xml);
 assert.equal(result.episodes[0].enclosure_url,'https://media.example.com/one.mp3');
});
