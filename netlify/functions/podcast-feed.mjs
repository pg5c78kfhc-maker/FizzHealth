import {parsePodcastFeed} from '../../src/podcast/feedRetrieval.js';

const json=(status,payload)=>({statusCode:status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=300','access-control-allow-origin':'*'},body:JSON.stringify(payload)});
const safeFeed=value=>{try{const url=new URL(String(value||''));if(url.protocol!=='https:')return null;if(/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname))return null;return url}catch{return null}};

export async function handler(event){
 const feed=safeFeed(event.queryStringParameters?.url);if(!feed)return json(400,{error:'A valid public HTTPS RSS feed URL is required.'});
 try{
  const response=await fetch(feed,{headers:{'user-agent':'FizzHealth/1.4.16.23 (+podcast RSS compatibility service)','accept':'application/rss+xml, application/atom+xml, text/xml, application/xml'}});
  if(!response.ok)throw new Error(`Feed returned HTTP ${response.status}.`);
  const xml=await response.text();
  return json(200,parsePodcastFeed(xml));
 }catch(error){return json(502,{error:error?.message||'The podcast feed could not be loaded.'})}
}
