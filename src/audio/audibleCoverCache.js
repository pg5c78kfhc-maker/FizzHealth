const CACHE_NAME='fizz-audible-covers-v1';
const remoteUrl=value=>/^https?:\/\//i.test(String(value||'').trim())?String(value).trim():null;

export const AUDIBLE_COVER_CACHE_NAME=CACHE_NAME;

export function audibleRemoteCoverUrl(book={}){
  return remoteUrl(book.cover_image_url);
}

export async function primeAudibleCoverCache(books,{fetchImpl=globalThis.fetch,cacheStorage=globalThis.caches,concurrency=6}={}){
  if(typeof fetchImpl!=='function')return {attempted:0,fulfilled:0,failed:0,alreadyCached:0};
  const urls=[...new Set((books||[]).map(audibleRemoteCoverUrl).filter(Boolean))];
  const cache=cacheStorage?.open?await cacheStorage.open(CACHE_NAME).catch(()=>null):null;
  let cursor=0,fulfilled=0,failed=0,alreadyCached=0;
  const workers=Array.from({length:Math.min(Math.max(1,Number(concurrency)||1),urls.length||1)},async()=>{
    while(cursor<urls.length){
      const url=urls[cursor++];
      try{
        if(cache&&await cache.match(url)){alreadyCached++;continue;}
        const response=await fetchImpl(url,{mode:'no-cors',cache:'default',credentials:'omit'});
        if(!response)throw new Error('No cover response');
        if(cache&&(response.ok||response.type==='opaque'))await cache.put(url,response.clone());
        fulfilled++;
      }catch{failed++;}
    }
  });
  await Promise.all(workers);
  return {attempted:urls.length,fulfilled,failed,alreadyCached};
}
