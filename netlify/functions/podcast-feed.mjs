const json=(status,payload)=>({
  statusCode:status,
  headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'public, max-age=300',
    'access-control-allow-origin':'*'
  },
  body:JSON.stringify(payload)
});

const safeFeed=value=>{
  try{
    const url=new URL(String(value||''));
    if(!['http:','https:'].includes(url.protocol))return null;
    const host=url.hostname.toLowerCase();
    if(host==='localhost'||host==='0.0.0.0'||host==='::1'||/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host))return null;
    return url;
  }catch{return null}
};

export async function handler(event){
  const feed=safeFeed(event.queryStringParameters?.url);
  if(!feed)return json(400,{error:'A valid public RSS feed URL is required.'});
  try{
    const response=await fetch(feed,{redirect:'follow',headers:{
      'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 FizzHealth/1.4.16.24',
      'accept':'application/rss+xml, application/atom+xml, text/xml, application/xml, */*',
      'accept-language':'en-US,en;q=0.9'
    }});
    if(!response.ok)return json(502,{error:`Feed returned HTTP ${response.status}.`,status:response.status});
    const contentType=String(response.headers.get('content-type')||'');
    const xml=await response.text();
    if(xml.length>8_000_000)return json(413,{error:'The podcast feed is too large.'});
    if(!/<(?:rss|feed)\b/i.test(xml.slice(0,20000)))return json(502,{error:'The feed host returned content that was not RSS or Atom.',contentType,finalUrl:response.url});
    return json(200,{xml,contentType,finalUrl:response.url||feed.toString()});
  }catch(error){
    return json(502,{error:error?.message||'The podcast feed could not be loaded.',name:error?.name||'Error'});
  }
}
