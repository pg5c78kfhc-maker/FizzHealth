const entityText=(value='')=>String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
const tag=(xml,names)=>{for(const name of names){const match=xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'));if(match)return entityText(match[1])}return ''};
const attr=(xml,name,attribute='url')=>xml.match(new RegExp(`<${name}[^>]*\\s${attribute}=["']([^"']+)["'][^>]*>`,'i'))?.[1]||'';
const durationSeconds=value=>{const clean=entityText(value);if(!clean)return 0;if(/^\d+$/.test(clean))return Number(clean);const parts=clean.split(':').map(Number);return parts.every(Number.isFinite)?parts.reduce((sum,n)=>sum*60+n,0):0};
const safePublicUrl=value=>{try{const url=new URL(String(value||''));return url.protocol==='https:'||url.protocol==='http:'?url.toString():''}catch{return ''}};
const browserSafeUrl=value=>{const url=safePublicUrl(value);return url.startsWith('https://')?url:''};
const mediaUrl=value=>{const url=safePublicUrl(value);if(!url)return '';return url.startsWith('http://')?`https://${url.slice(7)}`:url};
export function parsePodcastFeed(xml,{fallbackMetadata={}}={}){
 const source=String(xml||'');
 const feedType=/<feed\b/i.test(source.slice(0,20000))?'atom':/<rss\b/i.test(source.slice(0,20000))?'rss':'';
 if(!feedType)throw Object.assign(new Error('The response was not a valid RSS or Atom feed.'),{code:'invalid-rss'});
 if(source.length>8_000_000)throw Object.assign(new Error('The podcast feed is too large.'),{code:'feed-too-large'});
 const channel=source.split(/<item(?:\s[^>]*)?>/i)[0];
 const metadata={title:tag(channel,['title'])||fallbackMetadata.title||'',publisher:tag(channel,['itunes:author','dc:creator','author','managingEditor'])||fallbackMetadata.publisher||'',artwork_url:attr(channel,'itunes:image','href')||attr(channel,'image','href')||tag(tag(channel,['image']),['url'])||fallbackMetadata.artwork_url||'',website_url:tag(channel,['link'])||fallbackMetadata.website_url||''};
 const items=[...source.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(match=>match[1]);
 const episodes=items.map(item=>({title:tag(item,['title']),guid:tag(item,['guid','id']),published_at:tag(item,['pubDate','published','updated']),description:tag(item,['content:encoded','description','summary']),duration_seconds:durationSeconds(tag(item,['itunes:duration','duration'])),enclosure_url:mediaUrl(attr(item,'enclosure','url')),artwork_url:mediaUrl(attr(item,'itunes:image','href')||attr(item,'media:thumbnail','url')||attr(item,'media:content','url')),apple_podcasts_url:'',overcast_url:''})).filter(item=>item.title&&item.enclosure_url).sort((a,b)=>(new Date(b.published_at||0).getTime()||0)-(new Date(a.published_at||0).getTime()||0));
 return {episodes,metadata,feedType,xmlBytes:new TextEncoder().encode(source).length};
}
const capabilityKey=url=>`fizz:podcast-feed-capability:${encodeURIComponent(url)}`;
const readCapability=(storage,url)=>{try{return JSON.parse(storage?.getItem(capabilityKey(url))||'null')}catch{return null}};
const writeCapability=(storage,url,mode)=>{try{storage?.setItem(capabilityKey(url),JSON.stringify({mode,checkedAt:Date.now()}))}catch{}};
const withTimeout=async(fetchImpl,url,options,timeoutMs)=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetchImpl(url,{...options,signal:controller.signal})}finally{clearTimeout(timer)}};
const errorData=error=>({code:error?.code||error?.name||'error',message:String(error?.message||error),status:Number(error?.status)||undefined,stack:String(error?.stack||'').slice(0,3000)});
export async function retrievePodcastFeed({feedUrl,appleId='',fallbackMetadata={},fetchImpl=globalThis.fetch,storage=globalThis.localStorage,proxyUrl='/api/podcast-feed',timeoutMs=15000,onStatus=()=>{},onDiagnostic=()=>{}}){
 const url=safePublicUrl(feedUrl);if(!url)throw Object.assign(new Error('A valid public RSS feed URL is required.'),{code:'invalid-url',diagnostics:[]});
 const directUrl=browserSafeUrl(url),diagnostics=[],cached=readCapability(storage,url),cacheFresh=Boolean(cached&&Date.now()-Number(cached.checkedAt||0)<7*24*60*60*1000);
 const record=entry=>{diagnostics.push(entry);try{onDiagnostic(entry)}catch{}};
 onStatus({phase:'downloading-direct',label:'Downloading feed…'});let started=Date.now();
 try{
  if(!directUrl)throw Object.assign(new Error('The feed uses HTTP and must use compatibility mode.'),{code:'mixed-content'});
  const response=await withTimeout(fetchImpl,directUrl,{headers:{Accept:'application/rss+xml, application/atom+xml, text/xml, application/xml'}},timeoutMs),contentType=String(response.headers?.get?.('content-type')||'');
  if(!response.ok)throw Object.assign(new Error(`Feed returned HTTP ${response.status}.`),{code:'http-error',status:response.status,contentType,finalUrl:response.url||directUrl});
  const xml=await response.text();onStatus({phase:'parsing',label:'Parsing episodes…'});const payload=parsePodcastFeed(xml,{fallbackMetadata});
  record({stage:'direct',success:true,url:directUrl,status:response.status,contentType,finalUrl:response.url||directUrl,durationMs:Date.now()-started,xmlBytes:payload.xmlBytes,feedType:payload.feedType,episodesParsed:payload.episodes.length});
  writeCapability(storage,url,'direct');return {...payload,retrieval:{mode:'direct',diagnostics,contentType,cacheFresh,finalUrl:response.url||directUrl,requestedUrl:url}};
 }catch(error){record({stage:'direct',success:false,url:directUrl||url,durationMs:Date.now()-started,cachedMode:cacheFresh?cached?.mode||'':'',...errorData(error),contentType:error?.contentType||'',finalUrl:error?.finalUrl||''});}
 onStatus({phase:'proxy',label:'Using compatibility mode…'});started=Date.now();
 try{
  const params=new URLSearchParams({url});if(appleId)params.set('appleId',appleId);const requestUrl=`${proxyUrl}?${params}`;
  const response=await withTimeout(fetchImpl,requestUrl,{},timeoutMs),contentType=String(response.headers?.get?.('content-type')||'');
  if(!contentType.toLowerCase().includes('application/json'))throw Object.assign(new Error('Podcast compatibility service returned an unexpected response.'),{code:'proxy-non-json',status:response.status,contentType,finalUrl:response.url||requestUrl});
  const payload=await response.json();if(!response.ok)throw Object.assign(new Error(payload?.error||`Compatibility service returned HTTP ${response.status}.`),{code:'proxy-http-error',status:response.status,contentType,finalUrl:payload?.finalUrl||response.url||requestUrl,proxyPayload:payload});
  let parsed;if(typeof payload?.xml==='string'){onStatus({phase:'parsing',label:'Parsing episodes…'});parsed=parsePodcastFeed(payload.xml,{fallbackMetadata})}else if(Array.isArray(payload?.episodes)){parsed={episodes:payload.episodes,metadata:payload.metadata||fallbackMetadata,feedType:payload.feedType||'legacy-json',xmlBytes:Number(payload.xmlBytes)||0}}else throw Object.assign(new Error('Compatibility service returned invalid podcast data.'),{code:'proxy-invalid-payload'});
  record({stage:'proxy',success:true,url:requestUrl,feedUrl:url,status:response.status,contentType,finalUrl:payload?.finalUrl||url,redirectChain:payload?.redirectChain||[],durationMs:Date.now()-started,xmlBytes:parsed.xmlBytes,feedType:parsed.feedType,episodesParsed:parsed.episodes.length});
  writeCapability(storage,url,'proxy');onStatus({phase:'ready',label:'Podcast ready.'});return {...parsed,retrieval:{mode:'proxy',diagnostics,contentType,cacheFresh,finalUrl:payload?.finalUrl||url,requestedUrl:url}};
 }catch(error){record({stage:'proxy',success:false,url:`${proxyUrl}?url=${encodeURIComponent(url)}`,feedUrl:url,durationMs:Date.now()-started,...errorData(error),contentType:error?.contentType||'',finalUrl:error?.finalUrl||'',proxyPayload:error?.proxyPayload||null});throw Object.assign(new Error('Couldn’t retrieve this podcast feed.'),{code:'feed-retrieval-failed',diagnostics,cause:error,requestedUrl:url})}
}
