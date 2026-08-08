const CATALOG_BASE='https://api.audible.com/1.0/catalog/products';
const RESPONSE_GROUPS='contributors,media,product_attrs,product_desc,product_extended_attrs,series';
// Audible's catalog endpoint accepts a constrained set of image sizes; 500 caused HTTP 400 and prevented all metadata enrichment.
const IMAGE_SIZES='570';

const cleanAsin=value=>String(value||'').trim().toUpperCase();
const positiveInt=value=>{const number=Number(value);return Number.isFinite(number)&&number>0?Math.round(number):null};

export function normalizeAudibleCatalogProduct(product={}){
  const asin=cleanAsin(product.asin);
  const images=product.product_images&&typeof product.product_images==='object'?product.product_images:{};
  const coverImageUrl=images['570']||images['558']||images['900']||images['1215']||images['500']||images['1024']||images['2400']||Object.values(images).find(value=>typeof value==='string'&&/^https?:/i.test(value))||null;
  const runtimeMinutes=positiveInt(product.runtime_length_min);
  return {asin,coverImageUrl,runtimeMinutes};
}

export async function fetchAudibleCatalogMetadata(asins,{fetchImpl=globalThis.fetch,batchSize=50}={}){
  if(typeof fetchImpl!=='function')throw new Error('Audible catalog fetch is unavailable in this environment.');
  const unique=[...new Set((asins||[]).map(cleanAsin).filter(Boolean))];
  const results=new Map();
  for(let offset=0;offset<unique.length;offset+=Math.max(1,Math.min(50,Number(batchSize)||50))){
    const batch=unique.slice(offset,offset+Math.max(1,Math.min(50,Number(batchSize)||50)));
    const params=new URLSearchParams({asins:batch.join(','),response_groups:RESPONSE_GROUPS,image_sizes:IMAGE_SIZES});
    const response=await fetchImpl(`${CATALOG_BASE}?${params.toString()}`,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`Audible catalog request failed (${response.status}).`);
    const payload=await response.json();
    const products=Array.isArray(payload?.products)?payload.products:Array.isArray(payload)?payload:payload?.product?[payload.product]:[];
    for(const product of products){
      const normalized=normalizeAudibleCatalogProduct(product);
      if(normalized.asin)results.set(normalized.asin,normalized);
    }
  }
  return results;
}

export function runtimeDisplayFromMinutes(value){
  const minutes=positiveInt(value);
  if(!minutes)return null;
  const hours=Math.floor(minutes/60),remainder=minutes%60;
  if(hours&&remainder)return `${hours}h ${remainder}m`;
  if(hours)return `${hours}h`;
  return `${remainder}m`;
}

export function aggregateAudioDurationDisplay(value){
  const minutes=Math.max(0,Math.floor(Number(value)||0));
  const yearMinutes=365*24*60,dayMinutes=24*60;
  let remaining=minutes;
  const years=Math.floor(remaining/yearMinutes);remaining%=yearMinutes;
  const days=Math.floor(remaining/dayMinutes);remaining%=dayMinutes;
  const hours=Math.floor(remaining/60);const mins=remaining%60;
  const parts=[];if(years)parts.push(`${years}y`);if(days)parts.push(`${days}d`);if(hours)parts.push(`${hours}h`);if(mins||!parts.length)parts.push(`${mins}m`);
  return parts.join(' ');
}
