const DAY=86400000;
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const dateMs=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null};
const yes=v=>['yes','true','1','on hand','available','verified'].includes(String(v??'').trim().toLowerCase());
const round=(v,d=1)=>Math.round(num(v)*10**d)/10**d;

export function inventoryState(item={}){
 const status=String(item.status||'').trim().toLowerCase();
 if(['archived','deleted','discarded'].includes(status))return 'archived';
 const quantity=Number.isFinite(Number(item.quantity))?Math.max(0,num(item.quantity)):null;
 const remaining=Number.isFinite(Number(item.remaining_servings))?Math.max(0,num(item.remaining_servings)):null;
 if(quantity!==null)return quantity>0?'in_stock':'out_of_stock';
 if(remaining!==null)return remaining>0?'in_stock':'out_of_stock';
 return yes(item.on_hand??'Yes')?'in_stock':'out_of_stock';
}

export function calculateAvailableServings(item={}){
 if(inventoryState(item)!=='in_stock')return 0;
 if(Number.isFinite(Number(item.remaining_servings)))return Math.max(0,num(item.remaining_servings));
 const serving=num(item.serving_size||item.default_serving||1);
 return serving>0?Math.max(0,num(item.quantity)/serving):Math.max(0,num(item.quantity));
}

export function pantryConfidence(item={},events=[],now=Date.now()){
 let score=35;const relevant=events.filter(e=>String(e.pantry_id)===String(item.pantry_id));
 const latest=[item.verified_at,item.purchase_date,item.opened_date,...relevant.map(e=>e.event_at||e.occurred_at)].map(dateMs).filter(v=>v!==null).sort((a,b)=>b-a)[0];
 const ageDays=latest==null?90:Math.max(0,(now-latest)/DAY);
 if(item.verified_at)score+=30;if(item.purchase_date)score+=12;if(Number.isFinite(Number(item.quantity)))score+=10;
 if(relevant.some(e=>['purchase','restock','verify','confirmation'].includes(String(e.event_type).toLowerCase())))score+=14;
 score-=Math.min(50,ageDays*.75);if(String(item.quantity_accuracy||'').toLowerCase()==='disputed')score-=25;
 return Math.round(clamp(score));
}

export function freshnessStatus(item={},now=Date.now()){
 const purchase=dateMs(item.purchase_date),opened=dateMs(item.opened_date),explicit=dateMs(item.expiration||item.best_by);
 const storage=String(item.storage_type||item.location||'pantry').toLowerCase();
 const manufacturer=num(item.manufacturer_shelf_life_days||item.shelf_life_days);
 const openedLife=num(item.opened_shelf_life_days);
 const storageMultiplier=storage.includes('freezer')?3:storage.includes('refriger')?1:0.8;
 const candidates=[];
 if(explicit!==null)candidates.push(explicit);
 if(purchase!==null&&manufacturer>0)candidates.push(purchase+manufacturer*storageMultiplier*DAY);
 if(opened!==null&&openedLife>0)candidates.push(opened+openedLife*DAY);
 const thaw=dateMs(item.thaw_date);if(thaw!==null)candidates.push(thaw+num(item.thaw_life_days||3)*DAY);
 const effective=candidates.length?Math.min(...candidates):null;
 if(effective===null)return {status:'unknown',quality:'unknown',safety:'unknown',daysRemaining:null,effectiveExpiration:null};
 const days=Math.ceil((effective-now)/DAY);const observation=String(item.freshness_observation||'').toLowerCase();
 const quality=observation.includes('poor')?'poor':days<0?'past best quality':days<=2?'use soon':days<=7?'good':'fresh';
 const safety=days<-3?'review/discard':days<0?'inspect carefully':'safe by recorded dates';
 return {status:days<0?'expired':days===0?'today':days<=3?'urgent':days<=7?'soon':'fresh',quality,safety,daysRemaining:days,effectiveExpiration:new Date(effective).toISOString().slice(0,10)};
}

export function costMetrics(item={}){
 const cost=num(item.purchase_price||item.last_price||item.cost);const servings=Math.max(.01,num(item.servings_purchased)||calculateAvailableServings({...item,remaining_servings:item.original_servings})||1);
 const proteinPerServing=num(item.protein||item.protein_g);const caloriesPerServing=num(item.calories);
 return {costPerServing:round(cost/servings,2),costPerProteinGram:proteinPerServing>0?round((cost/servings)/proteinPerServing,3):null,costPer100Calories:caloriesPerServing>0?round((cost/servings)*100/caloriesPerServing,2):null};
}

export function forecastPantry(item={},plannedMeals=[],history=[],startDate=new Date()){
 const available=calculateAvailableServings(item),id=String(item.pantry_id??item.food_id??'');
 const planned=plannedMeals.filter(m=>String(m.pantry_id??m.food_id)===id).reduce((s,m)=>s+num(m.servings||m.quantity||1),0);
 const relevant=history.filter(h=>String(h.pantry_id??h.food_id)===id);
 let dailyRate=num(item.average_daily_servings);
 if(!dailyRate&&relevant.length){const dates=relevant.map(h=>dateMs(h.event_at||h.eaten_at)).filter(v=>v!==null);const span=dates.length?Math.max(1,(Math.max(...dates)-Math.min(...dates))/DAY+1):7;dailyRate=relevant.reduce((s,h)=>s+Math.abs(num(h.servings||h.quantity||1)),0)/span}
 const remainingAfterPlan=Math.max(0,available-planned),daysRemaining=dailyRate>0?remainingAfterPlan/dailyRate:null;
 return {availableServings:round(available),plannedServings:round(planned),remainingAfterPlan:round(remainingAfterPlan),dailyRate:round(dailyRate,2),daysRemaining:daysRemaining==null?null:round(daysRemaining),runoutDate:daysRemaining==null?null:new Date(new Date(startDate).getTime()+Math.ceil(daysRemaining)*DAY).toISOString().slice(0,10)};
}

export function wasteRisk(item={},events=[],now=Date.now()){
 const fresh=freshnessStatus(item,now),servings=calculateAvailableServings(item),confidence=pantryConfidence(item,events,now);let score=0;const reasons=[];
 const weight={expired:100,today:94,urgent:80,soon:55,fresh:10,unknown:15};score+=weight[fresh.status]||0;
 if(yes(item.opened)){score+=12;reasons.push('Opened package')}if(item.thaw_date||String(item.status).toLowerCase()==='thawed'){score+=20;reasons.push('Thawed')}
 if(servings>=3&&['today','urgent','soon'].includes(fresh.status)){score+=Math.min(18,servings*3);reasons.push(`${round(servings)} servings remain`)}
 if(fresh.daysRemaining!=null&&fresh.daysRemaining<=2)reasons.unshift(fresh.daysRemaining<0?'Past recorded freshness date':`Use within ${Math.max(0,fresh.daysRemaining)} days`);
 if(confidence<45){score-=8;reasons.push('Verify quantity first')}
 return {score:Math.round(clamp(score)),band:score>=80?'critical':score>=55?'high':score>=30?'medium':'low',reasons};
}

export function opportunityScore(item={},events=[],now=Date.now()){
 const waste=wasteRisk(item,events,now),protein=num(item.protein),fiber=num(item.fiber),sat=num(item.saturated_fat),available=calculateAvailableServings(item);
 let score=waste.score*.5+Math.min(25,protein*.8)+Math.min(18,fiber*2)-Math.min(20,sat*3);
 if(available<=0)score=0;if(String(item.current_location_match??'yes').toLowerCase()==='no')score*=.2;
 return {score:Math.round(clamp(score)),healthGain:score>=75?'+10%':score>=55?'+7%':score>=35?'+4%':'+1%',label:score>=70?'Excellent next choice':score>=45?'Good next choice':'Available option'};
}

export function optimizeGroceries({items=[],plannedMeals=[],history=[],days=7}){
 const ids=new Set(items.map(i=>String(i.food_id||i.pantry_id)));const requirements=new Map();
 for(const meal of plannedMeals){const id=String(meal.food_id||meal.pantry_id||meal.food_name);const need=num(meal.servings||meal.quantity||1);requirements.set(id,(requirements.get(id)||0)+need)}
 for(const h of history){const id=String(h.food_id||h.pantry_id||h.food_name);if(!id)continue;requirements.set(id,Math.max(requirements.get(id)||0,num(h.average_weekly_servings)||0))}
 return [...requirements].map(([id,need])=>{const item=items.find(i=>[i.food_id,i.pantry_id,i.item].map(String).includes(id));const available=item?calculateAvailableServings(item):0;const qty=Math.max(0,Math.ceil(need-available));return {id,item:item?.item||item?.name||id,needed:round(need),available:round(available),buy:qty,unit:'servings',reason:qty?`Need ${qty} more serving${qty===1?'':'s'} for the next ${days} days`:'Already covered'}}).filter(x=>x.buy>0).sort((a,b)=>b.buy-a.buy);
}

export function pantryHealthScore(items=[],events=[],now=Date.now()){
 const active=items.filter(i=>calculateAvailableServings(i)>0);if(!active.length)return {score:null,label:'Not calculated',reason:'No in-stock items are available in the current view.',components:{freshness:null,variety:null,protein:null,fiber:null,waste:null,confidence:null}};
 const avg=a=>a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);const categories=new Set(active.map(i=>i.category).filter(Boolean)).size;
 const components={freshness:Math.round(avg(active.map(i=>Math.max(0,100-wasteRisk(i,events,now).score)))),variety:Math.round(clamp(categories*14)),protein:Math.round(clamp(active.filter(i=>num(i.protein)>=15).length/active.length*140)),fiber:Math.round(clamp(active.filter(i=>num(i.fiber)>=3).length/active.length*160)),waste:Math.round(avg(active.map(i=>100-wasteRisk(i,events,now).score))),confidence:Math.round(avg(active.map(i=>pantryConfidence(i,events,now))))};
 const score=Math.round(Object.values(components).reduce((s,v)=>s+v,0)/6);return {score,label:score>=80?'Ready to eat well':score>=60?'Good foundation':score>=40?'Needs attention':'Poorly prepared',components};
}

export function buildPantryIntelligence({items=[],events=[],plannedMeals=[],history=[],purchases=[],currentLocation='All',now=Date.now()}){
 const enriched=items.map(item=>{const inventory=inventoryState(item),forecast=forecastPantry(item,plannedMeals,history,new Date(now)),freshness=freshnessStatus(item,now),confidence=pantryConfidence(item,events,now),waste=wasteRisk(item,events,now),cost=costMetrics(item),locationMatch=(()=>{const selected=String(currentLocation||'All').toLowerCase(),location=String(item.location||'').toLowerCase();return selected==='all'?true:selected==='home'?['home','refrigerator','freezer','pantry','garage refrigerator','wine cellar','standalone freezer','standalone refrigerator'].some(x=>location===x||location.includes(x)):location.includes(selected)})();const opportunity=opportunityScore({...item,current_location_match:locationMatch?'yes':'no'},events,now);return {...item,inventoryState:inventory,available:inventory==='in_stock',remainingServings:calculateAvailableServings(item),confidence,freshness,waste,forecast,cost,locationMatch,opportunity,verificationState:inventory==='out_of_stock'?'Out of stock':confidence>=75?'Verified on hand':confidence>=45?'Probably on hand':'Verify'}}).sort((a,b)=>b.opportunity.score-a.opportunity.score||b.waste.score-a.waste.score);
 const shopping=optimizeGroceries({items:enriched,plannedMeals,history});const restock=enriched.filter(i=>i.available&&i.forecast.daysRemaining!=null&&i.forecast.daysRemaining<=7).sort((a,b)=>a.forecast.daysRemaining-b.forecast.daysRemaining);const outOfStock=enriched.filter(i=>i.inventoryState==='out_of_stock');
 const health=pantryHealthScore(enriched,events,now);const candidates=enriched.filter(i=>i.available&&i.locationMatch);enriched.items=enriched;enriched.recommendations=candidates.sort((a,b)=>b.opportunity.score-a.opportunity.score||b.confidence-a.confidence||String(a.item).localeCompare(String(b.item))).slice(0,8);enriched.wasteRisks=enriched.filter(i=>i.waste.score>=30).sort((a,b)=>b.waste.score-a.waste.score);enriched.restock=restock;enriched.outOfStock=outOfStock;enriched.shopping=shopping;enriched.health=health;enriched.currentLocation=currentLocation;return enriched;
}

export function pantryPriority(item={},events=[],now=Date.now()){
 const waste=wasteRisk(item,events,now);const servings=calculateAvailableServings(item);const confidence=pantryConfidence(item,events,now);const freshness=freshnessStatus(item,now);
 return {score:waste.score,status:freshness.status==='expired'?'expired':waste.band,reasons:waste.reasons,servings,confidence,freshness};
}

export function reconcilePantryItem(item={},event={}){
 const next={...item},type=String(event.event_type||event.type||'').toLowerCase(),delta=num(event.quantity);
 if(['purchase','restock'].includes(type)){next.quantity=Math.max(0,num(next.quantity)+delta);next.on_hand='Yes';next.purchase_date=event.event_at||new Date().toISOString()}
 if(['meal','consume','consumed'].includes(type)){next.quantity=Math.max(0,num(next.quantity)-Math.abs(delta));next.on_hand=next.quantity>0?'Yes':'No'}
 if(['verify','confirmation'].includes(type)){if(Number.isFinite(Number(event.quantity)))next.quantity=Math.max(0,delta);next.on_hand=event.on_hand??(next.quantity>0?'Yes':'No');next.verified_at=event.event_at||new Date().toISOString();next.quantity_accuracy='verified'}
 return next;
}
