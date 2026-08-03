import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePodcastFeed,retrievePodcastFeed} from '../src/podcast/feedRetrieval.js';

const xml=`<?xml version="1.0"?><rss><channel><title>Test Show</title><itunes:author>Publisher</itunes:author><item><title>Episode One</title><guid>one</guid><pubDate>Mon, 03 Aug 2026 12:00:00 GMT</pubDate><itunes:duration>5:11</itunes:duration><enclosure url="https://cdn.example.com/one.mp3"/></item></channel></rss>`;
const response=(body,{status=200,type='application/rss+xml'}={})=>({ok:status>=200&&status<300,status,headers:{get:name=>name.toLowerCase()==='content-type'?type:''},text:async()=>body,json:async()=>JSON.parse(body)});

test('parses RSS locally',()=>{const parsed=parsePodcastFeed(xml);assert.equal(parsed.metadata.title,'Test Show');assert.equal(parsed.episodes[0].duration_seconds,311)});
test('direct success never calls proxy',async()=>{const calls=[];const result=await retrievePodcastFeed({feedUrl:'https://feed.example.com/rss',fetchImpl:async url=>{calls.push(String(url));return response(xml)},storage:null});assert.equal(result.retrieval.mode,'direct');assert.equal(calls.length,1)});
test('CORS/direct failure falls back automatically to proxy',async()=>{const calls=[];const payload=JSON.stringify(parsePodcastFeed(xml));const result=await retrievePodcastFeed({feedUrl:'https://feed.example.com/rss',fetchImpl:async url=>{calls.push(String(url));if(calls.length===1)throw new TypeError('Failed to fetch');return response(payload,{type:'application/json'})},storage:null});assert.equal(result.retrieval.mode,'proxy');assert.equal(calls.length,2);assert.match(calls[1],/^\/api\/podcast-feed\?/)});
test('HTML proxy response is diagnosed instead of parsed as JSON',async()=>{await assert.rejects(()=>retrievePodcastFeed({feedUrl:'https://feed.example.com/rss',fetchImpl:async(_url)=>{if(_url==='https://feed.example.com/rss')throw new TypeError('Failed to fetch');return response('<html/>',{type:'text/html'})},storage:null}),error=>error.code==='feed-retrieval-failed'&&error.diagnostics.some(item=>item.code==='proxy-non-json'))});
