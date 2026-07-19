const DAY=86400000;
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const dateKey=v=>new Date(v).toISOString().slice(0,10);
const idOf=x=>String(x.food_id||x.pantry_id||x.recipe_id||x.restaurant_meal_id||x.name||x.item||'');
const servingsOf=x=>Math.max(0,num(x.available_servings??x.remainingServings??x.quantity??1));
const nutrition=x=>({calories:num(x.calories),protein:num(x.protein),carbs:num(x.carbs),fiber:num(x.fiber),fat:num(x.fat),saturated_fat:num(x.saturated_fat),sodium:num(x.sodium)});
const sum=(rows,key)=>rows.reduce((s,r)=>s+num(r.nutrition?.[key]??r[key]),0);

function candidateScore(candidate,{dayIndex,lastIds=[],recentMeals=[],targets={},pantryFirst=true}={}){
 const n=nutrition(candidate);let score=50;
 score+=Math.min(22,n.protein*.45)+Math.min(16,n.fiber*2)-Math.min(18,n.saturated_fat*2.5);
 if(pantryFirst&&candidate.pantry_id)score+=12;
 const freshness=num(candidate.waste?.score??candidate.waste_risk);score+=freshness*.25;
 const id=idOf(candidate);if(lastIds.includes(id))score-=35;
 const recentCount=recentMeals.filter(x=>idOf(x)===id).length;score-=Math.min(24,recentCount*8);
 const proteinFamily=String(candidate.category||candidate.protein_type||'').toLowerCase();
 if(lastIds.some(x=>String(x).includes(proteinFamily)&&proteinFamily))score-=8;
 if(num(targets.protein?.target)>0&&n.protein>=25)score+=5;
 if(num(targets.fiber?.target)>0&&n.fiber>=5)score+=5;
 return Math.round(clamp(score));
}

export function generateMealPlan({candidates=[],restaurantEvents=[],existingPlan=[],recentMeals=[],days=7,startDate=new Date(),targets={},mealsPerDay=2,lockedMeals=[]}={}){
 const horizon=[1,3,7,14,30].includes(Number(days))?Number(days):7;
 const inventory=new Map(candidates.map(c=>[idOf(c),servingsOf(c)]));
 const plan=[];const locked=[...existingPlan,...lockedMeals].filter(x=>x.lock_state==='locked'||x.flexibility==='locked');
 const start=new Date(startDate);start.setHours(12,0,0,0);
 for(let d=0;d<horizon;d++){
  const date=dateKey(start.getTime()+d*DAY);
  const fixed=[...locked.filter(x=>(x.planned_local_date||x.date)===date),...restaurantEvents.filter(x=>(x.planned_local_date||x.date)===date)];
  for(const f of fixed)plan.push({...f,date,slot:f.meal_type||'Dinner',source_type:f.source_type||'restaurant',lock_state:f.lock_state||'locked',nutrition:nutrition(f),planningScore:100});
  const needed=Math.max(0,mealsPerDay-fixed.length);
  for(let slot=0;slot<needed;slot++){
   const lastIds=plan.slice(-2).map(x=>idOf(x.candidate||x));
   const eligible=candidates.filter(c=>(inventory.get(idOf(c))||0)>0).map(c=>({candidate:c,score:candidateScore(c,{dayIndex:d,lastIds,recentMeals,targets})})).sort((a,b)=>b.score-a.score||idOf(a.candidate).localeCompare(idOf(b.candidate)));
   if(!eligible.length)break;
   const pick=eligible[0].candidate,id=idOf(pick);inventory.set(id,(inventory.get(id)||0)-1);
   plan.push({date,slot:slot===0?'Lunch':'Dinner',candidate:pick,food_id:pick.food_id,pantry_id:pick.pantry_id,food_name:pick.item||pick.name,source_type:'food',lock_state:'flexible',nutrition:nutrition(pick),planningScore:eligible[0].score,batch_group:pick.batch_servings>1?`batch-${id}-${date}`:null});
   const extras=Math.min(Math.max(0,num(pick.batch_servings)-1),inventory.get(id)||0,horizon-d-1);
   for(let e=1;e<=extras;e++){
    const leftoverDate=dateKey(start.getTime()+(d+e)*DAY);
    plan.push({date:leftoverDate,slot:'Lunch',candidate:pick,food_id:pick.food_id,pantry_id:pick.pantry_id,food_name:`${pick.item||pick.name} (leftover)`,source_type:'leftover',lock_state:'flexible',nutrition:nutrition(pick),planningScore:eligible[0].score+5,batch_group:`batch-${id}-${date}`,leftover_from:date});inventory.set(id,(inventory.get(id)||0)-1);
   }
  }
 }
 plan.sort((a,b)=>a.date.localeCompare(b.date)||String(a.slot).localeCompare(String(b.slot)));
 const required=horizon*mealsPerDay,planned=plan.length;
 return {plan,summary:{days:horizon,plannedMeals:planned,requiredMeals:required,coveragePercent:Math.round(planned/Math.max(1,required)*100),pantryMeals:plan.filter(x=>x.pantry_id).length,restaurantMeals:plan.filter(x=>x.source_type==='restaurant').length,leftovers:plan.filter(x=>x.source_type==='leftover').length,unfilled:Math.max(0,required-planned)}};
}

export function adaptMealPlan({plan=[],events=[],candidates=[],context={}}={}){
 const affected=new Set(events.map(e=>e.date||e.local_date||e.planned_local_date).filter(Boolean));
 const preserved=plan.filter(x=>x.lock_state==='locked'||!affected.has(x.date));
 if(!affected.size)return {plan,changed:0,preserved:plan.length,reasons:[]};
 const dates=[...affected].sort();const replacement=generateMealPlan({candidates,days:dates.length,startDate:new Date(`${dates[0]}T12:00:00`),targets:context.targets||{},mealsPerDay:context.mealsPerDay||2,lockedMeals:plan.filter(x=>x.lock_state==='locked')}).plan.filter(x=>affected.has(x.date));
 const next=[...preserved,...replacement].sort((a,b)=>a.date.localeCompare(b.date));
 return {plan:next,changed:replacement.length,preserved:preserved.length,reasons:events.map(e=>e.type||'Plan input changed')};
}

export function buildSmartShoppingList({plan=[],pantry=[]}={}){
 const demand=new Map();for(const row of plan){if(row.source_type==='restaurant')continue;const id=idOf(row.candidate||row);const name=row.candidate?.item||row.food_name||row.candidate?.name||id;const cur=demand.get(id)||{id,name,needed:0};cur.needed++;demand.set(id,cur)}
 return [...demand.values()].map(r=>{const item=pantry.find(p=>idOf(p)===r.id);const available=servingsOf(item||{});const buy=Math.max(0,Math.ceil(r.needed-available));return {...r,available,buy,suggestedSize:buy<=0?0:buy<=2?2:buy<=4?4:Math.ceil(buy/5)*5}}).filter(x=>x.buy>0).sort((a,b)=>b.buy-a.buy);
}

export function forecastMealPlan({plan=[],targets={},currentWeight=null}={}){
 const days=Math.max(1,new Set(plan.map(x=>x.date)).size);const avg={};for(const key of ['calories','protein','fiber','saturated_fat','sodium'])avg[key]=Math.round(sum(plan,key)/days*10)/10;
 const targetCalories=num(targets.calories?.target||1700);const dailyDelta=avg.calories-targetCalories;const weight30=currentWeight==null?null:Math.round((num(currentWeight)+dailyDelta*30/3500)*10)/10;
 const proteinConsistency=num(targets.protein?.target)?Math.round(clamp(avg.protein/num(targets.protein.target)*100)):null;
 const fiberConsistency=num(targets.fiber?.target)?Math.round(clamp(avg.fiber/num(targets.fiber.target)*100)):null;
 const satLimit=num(targets.saturated_fat?.max||targets.saturated_fat?.target||15);
 const ldlDirection=avg.fiber>=25&&avg.saturated_fat<=satLimit?'Improving':avg.saturated_fat>satLimit?'Worsening':'Stable';
 const pantryUtilization=plan.length?Math.round(plan.filter(x=>x.pantry_id).length/plan.length*100):0;
 return {days,averages:avg,weight30,weightDirection:dailyDelta<-100?'Down':dailyDelta>100?'Up':'Stable',ldlDirection,proteinConsistency,fiberConsistency,pantryUtilization,confidence:Math.round(clamp(45+Math.min(35,days*3)+Math.min(20,plan.length)))};
}

export function optimizeMealPlan(input={}){
 const generated=generateMealPlan(input);const shopping=buildSmartShoppingList({plan:generated.plan,pantry:input.candidates||[]});const forecast=forecastMealPlan({plan:generated.plan,targets:input.targets,currentWeight:input.currentWeight});
 const score=Math.round(clamp(generated.summary.coveragePercent*.35+forecast.pantryUtilization*.2+(forecast.proteinConsistency||60)*.2+(forecast.fiberConsistency||50)*.15+(forecast.ldlDirection==='Improving'?10:forecast.ldlDirection==='Stable'?5:0)));
 return {...generated,shopping,forecast,optimization:{score,label:score>=80?'Strong plan':score>=60?'Good plan':'Needs more inventory',priorities:['Nutrition goals','Pantry freshness','Variety','Waste reduction','Shopping minimization']}};
}
