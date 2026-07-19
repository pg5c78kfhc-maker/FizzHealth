const n=v=>Number.isFinite(Number(v))?Number(v):0;
const clean=v=>String(v??'').trim();
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,n(v)));
const money=/\$\s?(\d+(?:\.\d{1,2})?)/;
const sectionWords=/^(appetizers?|starters?|salads?|soups?|entrees?|mains?|seafood|chicken|beef|desserts?|drinks?|beverages?|sides?)$/i;
export function parseMenuText(text,{restaurantName=''}={}){
  const lines=String(text||'').split(/\r?\n/).map(clean).filter(Boolean);
  const sections=[];let current={name:'Menu',items:[]};sections.push(current);
  for(const line of lines){
    if(sectionWords.test(line.replace(/[:—-]+$/,''))){current={name:line.replace(/[:—-]+$/,''),items:[]};sections.push(current);continue}
    const price=line.match(money);const body=line.replace(money,'').trim();
    if(!body)continue;
    const parts=body.split(/\s+[—–-]\s+|\s{2,}/);const name=parts.shift();
    if(name&&name.length<=100)current.items.push({name,description:parts.join(' '),price:price?n(price[1]):null,source:'menu_ocr',confidence:price?.[1]?0.82:0.72});
  }
  return {restaurantName:restaurantName||null,sections:sections.filter(s=>s.items.length),itemCount:sections.reduce((a,s)=>a+s.items.length,0),confidence:lines.length?0.76:0};
}
export function recognizeMeal({candidates=[],components=[],beverage=null,source='photo'}={}){
  const foods=[...components,...candidates].filter(Boolean).map((x,i)=>({name:clean(x.name||x),portion_g:n(x.portion_g)||null,confidence:clamp(x.confidence??(.82-i*.08)),role:x.role||'food'}));
  if(beverage)foods.push({name:clean(beverage.name||beverage),portion_g:n(beverage.portion_g)||null,confidence:clamp(beverage.confidence??.75),role:'beverage'});
  const overall=foods.length?foods.reduce((a,f)=>a+f.confidence,0)/foods.length:0;
  return {foods,confidence:Math.round(overall*100),source,requiresConfirmation:overall<.9||foods.some(f=>!f.portion_g)};
}
export function estimatePortion({referenceGrams=0,visualScale=1,densityFactor=1,servings=1}={}){
  const grams=Math.max(0,Math.round(n(referenceGrams)*Math.max(.25,n(visualScale)||1)*Math.max(.4,n(densityFactor)||1)*Math.max(.25,n(servings)||1)));
  const uncertainty=grams?Math.max(15,Math.round(grams*(visualScale?0.18:0.35))):0;
  return {grams,range:[Math.max(0,grams-uncertainty),grams+uncertainty],confidence:grams?Math.round((visualScale?0.78:0.55)*100):0};
}
export function nutritionEstimate({portionGrams=0,per100g={},source='internal_estimate',correctionCount=0}={}){
  const factor=n(portionGrams)/100;const value=k=>Math.round(n(per100g[k])*factor*10)/10;
  const base=source==='restaurant_verified'?0.96:source==='verified_database'?0.9:source==='historical_correction'?0.84:0.62;
  return {calories:value('calories'),protein:value('protein'),carbs:value('carbs'),fiber:value('fiber'),fat:value('fat'),saturated_fat:value('saturated_fat'),sodium:value('sodium'),confidence:Math.round(clamp(base+Math.min(.1,n(correctionCount)*.02))*100),provenance:source,rangePercent:source==='restaurant_verified'?5:source==='verified_database'?10:source==='historical_correction'?15:25};
}
export function suggestModifications(meal={}){
  const mods=[];const add=(label,impact,reason)=>mods.push({label,impact,reason});
  if(/fried|crispy|breaded/i.test(`${meal.name||''} ${meal.description||''}`))add('Choose grilled instead','LDL improvement: moderate','Reduces frying oil and saturated fat.');
  if(/dressing|salad/i.test(`${meal.name||''} ${meal.description||''}`))add('Dressing on the side','Expected calories −80 to −180','You control how much is used.');
  if(/cheese|cream|alfredo|butter/i.test(`${meal.name||''} ${meal.description||''}`))add('Skip or reduce cheese/sauce','Saturated fat −3 to −8 g','Lowers saturated-fat exposure.');
  if(/fries|rice|potato/i.test(`${meal.name||''} ${meal.description||''}`))add('Substitute vegetables','Fiber +3 to +7 g','Improves fiber and calorie density.');
  add('Request sauce on the side','Expected health gain +3%','Reduces hidden calories and sodium.');
  return mods.slice(0,4);
}
export function reconcileOrder({receiptItems=[],recognizedItems=[],loggedItems=[]}={}){
  const norm=s=>clean(s).toLowerCase().replace(/[^a-z0-9 ]/g,'');
  return receiptItems.map(item=>{const key=norm(item.name||item);const candidates=[...loggedItems,...recognizedItems];let best=null,score=0;for(const c of candidates){const ck=norm(c.name||c.food_name||c);const common=key.split(' ').filter(w=>ck.includes(w)).length;const s=common/Math.max(1,key.split(' ').length);if(s>score){score=s;best=c}}return {receipt:item,match:score>=.45?best:null,confidence:Math.round(score*100),status:score>=.75?'matched':score>=.45?'review':'unmatched'}})}
export function buildRestaurantMemory({orders=[],corrections=[],acceptedRecommendations=[]}={}){
  const tally=(rows,key)=>Object.entries(rows.reduce((a,r)=>{const v=clean(r[key]);if(v)a[v]=(a[v]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1]).map(([value,count])=>({value,count}));
  return {favoriteOrders:tally(orders,'meal_name'),commonSubstitutions:tally(corrections,'modification'),preferredSides:tally(orders,'preferred_side'),preferredDrinks:tally(orders,'preferred_drink'),typicalPortions:tally(corrections,'portion_label'),acceptedRecommendations:tally(acceptedRecommendations,'recommendation')};
}
export function orchestrateCapture(input={}){
  const menu=input.menuText?parseMenuText(input.menuText,{restaurantName:input.restaurantName}):null;
  const recognition=input.photoAnalysis?recognizeMeal(input.photoAnalysis):null;
  return {captureId:`capture-${Date.now()}`,type:input.type||'meal_photo',menu,recognition,status:'review_required',confidence:Math.round(((menu?.confidence||recognition?.confidence/100||0))*100),provenance:input.provenance||'ai_assisted',createdAt:new Date().toISOString()};
}
