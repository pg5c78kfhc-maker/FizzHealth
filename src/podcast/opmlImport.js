const decodeXml=value=>String(value||'').replace(/&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const attr=(tag,name)=>{const match=tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`,'i'));return decodeXml(match?.[1]??match?.[2]??'').trim()};
export function parsePodcastOpml(xml){
 const source=String(xml||'');
 if(!/<opml\b/i.test(source))throw new Error('The selected file is not a valid OPML document.');
 const entries=[];
 for(const match of source.matchAll(/<outline\b[^>]*>/gi)){
  const tag=match[0],feedUrl=attr(tag,'xmlUrl')||attr(tag,'xmlurl');
  if(!feedUrl)continue;
  const title=attr(tag,'title')||attr(tag,'text')||'Untitled Podcast';
  const appleId=attr(tag,'applePodcastsID')||attr(tag,'applepodcastsid')||attr(tag,'itunesId')||attr(tag,'itunesid');
  const websiteUrl=attr(tag,'htmlUrl')||attr(tag,'htmlurl');
  entries.push({title,rss_feed_url:feedUrl,apple_podcasts_id:appleId,apple_podcasts_url:appleId?`https://podcasts.apple.com/podcast/id${appleId}`:'',website_url:websiteUrl});
 }
 if(!entries.length)throw new Error('No podcast subscriptions were found in this OPML file.');
 return entries;
}
export function classifyPodcastImports(entries,existing=[]){
 const feedSet=new Set(existing.map(item=>String(item.rss_feed_url||'').trim().toLowerCase()).filter(Boolean));
 const appleSet=new Set(existing.map(item=>String(item.directory_id||item.apple_podcasts_id||'').trim()).filter(Boolean));
 const titleSet=new Set(existing.map(item=>String(item.title||'').trim().toLowerCase()).filter(Boolean));
 const seenFeeds=new Set(),seenApple=new Set(),seenTitles=new Set(),importable=[],duplicates=[];
 for(const item of entries){
  const feed=String(item.rss_feed_url||'').trim().toLowerCase(),apple=String(item.apple_podcasts_id||'').trim(),title=String(item.title||'').trim().toLowerCase();
  const duplicate=(feed&&(feedSet.has(feed)||seenFeeds.has(feed)))||(apple&&(appleSet.has(apple)||seenApple.has(apple)))||(title&&(titleSet.has(title)||seenTitles.has(title)));
  (duplicate?duplicates:importable).push(item);
  if(feed)seenFeeds.add(feed);if(apple)seenApple.add(apple);if(title)seenTitles.add(title);
 }
 return {importable,duplicates};
}
