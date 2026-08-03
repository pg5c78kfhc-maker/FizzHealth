export function podcastText(value){
  if(value===null||value===undefined)return '';
  if(typeof value==='string'||typeof value==='number'||typeof value==='boolean')return String(value).trim();
  if(Array.isArray(value))return value.map(podcastText).filter(Boolean).join(', ');
  if(typeof value==='object'){
    for(const key of ['label','name','title','text','value']){
      const text=podcastText(value[key]);
      if(text)return text;
    }
    try{return JSON.stringify(value)}catch{return ''}
  }
  return '';
}

export function podcastList(value){
  if(value===null||value===undefined||value==='')return [];
  if(Array.isArray(value))return [...new Set(value.flatMap(podcastList).map(podcastText).filter(Boolean))];
  if(typeof value==='object')return [...new Set(Object.entries(value).flatMap(([key,item])=>{
    if(item===true||item===1||item==='1')return [key];
    if(item===false||item===0||item==='0'||item===null||item===undefined)return [];
    return podcastList(item);
  }).map(podcastText).filter(Boolean))];
  const text=podcastText(value);
  if(!text)return [];
  if(text.startsWith('[')||text.startsWith('{')){
    try{return podcastList(JSON.parse(text))}catch{}
  }
  return [...new Set(text.split(/[,;|]/).map(item=>item.trim()).filter(Boolean))];
}

export function podcastUrl(value){
  const text=podcastText(value);
  if(!text)return '';
  try{
    const parsed=new URL(text);
    return ['http:','https:'].includes(parsed.protocol)?parsed.href:'';
  }catch{return ''}
}

export function normalizePodcastRecord(record){
  const source=record&&typeof record==='object'?record:{};
  return {
    ...source,
    title:podcastText(source.title)||'Untitled Podcast',
    publisher:podcastText(source.publisher),
    description:podcastText(source.description),
    artwork_url:podcastUrl(source.artwork_url),
    rss_feed_url:podcastUrl(source.rss_feed_url),
    apple_podcasts_url:podcastUrl(source.apple_podcasts_url),
    website_url:podcastUrl(source.website_url),
    categories:podcastList(source.categories)
  };
}
