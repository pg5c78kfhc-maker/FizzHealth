const entityText=(value='')=>String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
const tag=(xml,names)=>{for(const name of names){const match=xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'));if(match)return entityText(match[1])}return ''};
const attr=(xml,name,attribute='url')=>xml.match(new RegExp(`<${name}[^>]*\\s${attribute}=["']([^"']+)["'][^>]*>`,'i'))?.[1]||'';
const durationSeconds=value=>{const clean=entityText(value);if(!clean)return 0;if(/^\d+$/.test(clean))return Number(clean);const parts=clean.split(':').map(Number);return parts.every(Number.isFinite)?parts.reduce((sum,n)=>sum*60+n,0):0};
const safeHttpsUrl=value=>{try{const url=new URL(String(value||''));return url.protocol==='https:'?url.toString():''}catch{return ''}};

export function parsePodcastFeed(xml,{fallbackMetadata={}}={}){
 const source=String(xml||'');
 if(!/<(?:rss|feed)\b/i.test(source))throw Object.assign(new Error('The response was not a valid RSS or Atom feed.'),{code:'invalid-rss'});
 if(source.length>8_000_000)throw Object.assign(new Error('The podcast feed is too large.'),{code:'feed-too-large'});
 const channel=source.split(/<item(?:\s[^>]*)?>/i)[0];
 const metadata={
  title:tag(channel,['title'])||fallbackMetadata.title||'',
  publisher:tag(channel,['itunes:author','dc:creator','author','managingEditor'])||fallbackMetadata.publisher||'',
  artwork_url:attr(channel,'itunes:image','href')||attr(channel,'image','href')||tag(tag(channel,['image']),['url'])||fallbackMetadata.artwork_url||'',
  website_url:tag(channel,['link'])||fallbackMetadata.website_url||''
 };
 const items=[...source.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(match=>match[1]);
 const episodes=items.map(item=>({
  title:tag(item,['title']),
  guid:tag(item,['guid','id']),
  published_at:tag(item,['pubDate','published','updated']),
  description:tag(item,['content:encoded','description','summary']),
  duration_seconds:durationSeconds(tag(item,['itunes:duration','duration'])),
  enclosure_url:safeHttpsUrl(attr(item,'enclosure','url')),
  artwork_url:safeHttpsUrl(attr(item,'itunes:image','href')||attr(item,'media:thumbnail','url')||attr(item,'media:content','url')),
  apple_podcasts_url:'',overcast_url:''
 })).filter(item=>item.title&&item.enclosure_url).sort((a,b)=>(new Date(b.published_at||0).getTime()||0)-(new Date(a.published_at||0).getTime()||0));
 return {episodes,metadata};
}

const capabilityKey=url=>`fizz:podcast-feed-capability:${encodeURIComponent(url)}`;
const readCapability=(storage,url)=>{try{return JSON.parse(storage?.getItem(capabilityKey(url))||'null')}catch{return null}};
const writeCapability=(storage,url,mode)=>{try{storage?.setItem(capabilityKey(url),JSON.stringify({mode,checkedAt:Date.now()}))}catch{}};
const withTimeout=async(fetchImpl,url,options,timeoutMs)=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetchImpl(url,{...options,signal:controller.signal})}finally{clearTimeout(timer)}};
const diagnostic=(stage,error,extra={})=>({stage,code:error?.code||error?.name||'error',message:String(error?.message||error),...extra});

export async function retrievePodcastFeed({feedUrl,appleId='',fallbackMetadata={},fetchImpl=globalThis.fetch,storage=globalThis.localStorage,proxyUrl='/api/podcast-feed',timeoutMs=15000,onStatus=()=>{}}){
 const url=safeHttpsUrl(feedUrl);if(!url)throw Object.assign(new Error('A valid public HTTPS RSS feed URL is required.'),{code:'invalid-url',diagnostics:[]});
 const diagnostics=[],cached=readCapability(storage,url),cacheFresh=Boolean(cached&&Date.now()-Number(cached.checkedAt||0)<7*24*60*60*1000);
 onStatus({phase:'downloading-direct',label:'Downloading feed…'});
 try{
  const response=await withTimeout(fetchImpl,url,{headers:{Accept:'application/rss+xml, application/atom+xml, text/xml, application/xml'}},timeoutMs);
  if(!response.ok)throw Object.assign(new Error(`Feed returned HTTP ${response.status}.`),{code:'http-error',status:response.status});
  const contentType=String(response.headers?.get?.('content-type')||'');
  const xml=await response.text();
  onStatus({phase:'parsing',label:'Parsing episodes…'});
  const payload=parsePodcastFeed(xml,{fallbackMetadata});writeCapability(storage,url,'direct');
  return {...payload,retrieval:{mode:'direct',diagnostics,contentType,cacheFresh}};
 }catch(error){diagnostics.push(diagnostic('direct',error,{cachedMode:cacheFresh?cached?.mode||'':''}));}
 onStatus({phase:'proxy',label:'Using compatibility mode…'});
 try{
  const params=new URLSearchParams({url});if(appleId)params.set('appleId',appleId);
  const response=await withTimeout(fetchImpl,`${proxyUrl}?${params}`,{},timeoutMs);
  const contentType=String(response.headers?.get?.('content-type')||'');
  if(!contentType.toLowerCase().includes('application/json'))throw Object.assign(new Error('Podcast compatibility service returned an unexpected response.'),{code:'proxy-non-json'});
  const payload=await response.json();if(!response.ok)throw Object.assign(new Error(payload?.error||`Compatibility service returned HTTP ${response.status}.`),{code:'proxy-http-error'});
  if(!Array.isArray(payload?.episodes))throw Object.assign(new Error('Compatibility service returned invalid podcast data.'),{code:'proxy-invalid-payload'});
  writeCapability(storage,url,'proxy');onStatus({phase:'ready',label:'Podcast ready.'});
  return {...payload,retrieval:{mode:'proxy',diagnostics,contentType,cacheFresh}};
 }catch(error){diagnostics.push(diagnostic('proxy',error));const final=Object.assign(new Error('Couldn’t retrieve this podcast feed.'),{code:'feed-retrieval-failed',diagnostics,cause:error});throw final}
}
