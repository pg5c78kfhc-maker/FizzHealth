const n=value=>Number.isFinite(Number(value))?Number(value):0;
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,value));
const avg=values=>values.length?values.reduce((sum,value)=>sum+n(value),0)/values.length:0;
const round=(value,digits=0)=>{const scale=10**digits;return Math.round(n(value)*scale)/scale};

export function predictEndOfDay({totals={},plannedTotals={},targets={},history=[],hour=new Date().getHours(),usualDinner=null}={}){
 const elapsed=Math.max(1,Math.min(24,n(hour)+1));
 const dayShare=elapsed/24;
 const keys=['calories','protein','fiber','saturated_fat','sodium'];
 const historical=history.slice(-14);
 const historicalAverages=Object.fromEntries(keys.map(key=>[key,avg(historical.map(day=>day[key]).filter(Number.isFinite))]));
 const baseline={};
 for(const key of keys){
  const consumed=n(totals[key]),planned=n(plannedTotals[key]);
  const pace=consumed/dayShare;
  const historyValue=n(historicalAverages[key]);
  const blended=historyValue?pace*.55+historyValue*.45:pace;
  baseline[key]=round(Math.max(consumed+planned,blended),1);
 }
 const nothingElse=Object.fromEntries(keys.map(key=>[key,round(n(totals[key]),1)]));
 const usual=usualDinner||{
  calories:Math.max(0,n(historicalAverages.calories)-n(totals.calories)),
  protein:Math.max(0,n(historicalAverages.protein)-n(totals.protein)),
  fiber:Math.max(0,n(historicalAverages.fiber)-n(totals.fiber)),
  saturated_fat:Math.max(0,n(historicalAverages.saturated_fat)-n(totals.saturated_fat)),
  sodium:Math.max(0,n(historicalAverages.sodium)-n(totals.sodium))
 };
 const usualDinnerProjection=Object.fromEntries(keys.map(key=>[key,round(n(totals[key])+n(usual[key]),1)]));
 const fiberTarget=n(targets.fiber?.target)||30;
 const satLimit=n(targets.saturated_fat?.max??targets.saturated_fat?.target)||20;
 const ldlScore=projection=>clamp(75+(n(projection.fiber)-fiberTarget)*1.2-(Math.max(0,n(projection.saturated_fat)-satLimit)*3));
 return {
  baseline:{...baseline,ldl_score:round(ldlScore(baseline))},
  nothingElse:{...nothingElse,ldl_score:round(ldlScore(nothingElse))},
  usualDinner:{...usualDinnerProjection,ldl_score:round(ldlScore(usualDinnerProjection))},
  confidence:clamp(45+historical.length*3+(plannedTotals&&Object.values(plannedTotals).some(n)?10:0)),
  explanation:historical.length>=5?'Blends today’s pace, planned meals, and recent daily patterns.':'Uses today’s pace and planned meals while more history is collected.'
 };
}

export function opportunityScore({label='',nutrition={},stepDelta=0,targets={},current={},goalProbabilityDelta=0}={}){
 const fiberGap=Math.max(0,n(targets.fiber?.target)-n(current.fiber));
 const proteinGap=Math.max(0,n(targets.protein?.target)-n(current.protein));
 const satLimit=n(targets.saturated_fat?.max??targets.saturated_fat?.target)||20;
 let points=0;
 points+=Math.min(fiberGap,n(nutrition.fiber))*1.5;
 points+=Math.min(proteinGap,n(nutrition.protein))*.35;
 points-=Math.max(0,n(current.saturated_fat)+n(nutrition.saturated_fat)-satLimit)*2.2;
 points+=Math.min(12,n(stepDelta)/500);
 points+=n(goalProbabilityDelta)*.4;
 const score=clamp(50+points);
 return {label,score:round(score),expectedHealthGain:round((score-50)/5,1),ldlImpact:points>=12?'High':points>=5?'Moderate':points>0?'Small':'Neutral',reason:points>=0?'Expected to improve the highest-priority gaps.':'Likely to increase an active limit or reduce goal progress.'};
}

export function buildDecisionQueue({totals={},targets={},steps=0,stepTarget=10000,candidates=[]}={}){
 const actions=[];
 const add=(id,label,priority,reason,kind='nutrition')=>actions.push({id,label,priority:round(clamp(priority)),reason,kind});
 const fiberGap=Math.max(0,n(targets.fiber?.target)-n(totals.fiber));
 const proteinGap=Math.max(0,n(targets.protein?.target)-n(totals.protein));
 const satLimit=n(targets.saturated_fat?.max??targets.saturated_fat?.target)||20;
 const sodiumLimit=n(targets.sodium?.max??targets.sodium?.target)||2300;
 const stepGap=Math.max(0,n(stepTarget)-n(steps));
 if(fiberGap>0)add('fiber',`Eat ${Math.ceil(fiberGap)} g more fiber`,55+fiberGap,`${round(n(totals.fiber),1)} g consumed against a ${round(n(targets.fiber?.target),0)} g target.`);
 if(stepGap>0)add('steps',`Walk ${(Math.ceil(stepGap/100)*100).toLocaleString()} more steps`,48+stepGap/220,`${Math.round(steps).toLocaleString()} of ${Math.round(stepTarget).toLocaleString()} steps completed.`,'activity');
 if(n(totals.saturated_fat)>=satLimit*.8)add('sat-fat','Avoid additional saturated fat',72+Math.max(0,n(totals.saturated_fat)-satLimit)*4,`${round(n(totals.saturated_fat),1)} g consumed against a ${round(satLimit,0)} g limit.`);
 if(proteinGap>0)add('protein',`Add ${Math.ceil(proteinGap)} g lean protein`,45+proteinGap*.45,`${round(n(totals.protein),1)} g consumed against a ${round(n(targets.protein?.target),0)} g target.`);
 if(n(totals.sodium)>=sodiumLimit*.8)add('sodium','Choose a lower-sodium next meal',65,`${Math.round(n(totals.sodium))} mg consumed against a ${Math.round(sodiumLimit)} mg limit.`);
 for(const candidate of candidates){const scored=opportunityScore({...candidate,targets,current:totals});add(`candidate-${candidate.label}`,candidate.label,scored.score,scored.reason,'opportunity')}
 return actions.sort((a,b)=>b.priority-a.priority).slice(0,5).map((action,index)=>({...action,rank:index+1}));
}

export function calculateNutritionDebtCredit({days=[],targets={}}={}){
 const window=days.slice(-7);
 const result={};
 const configs={
  fiber:{target:n(targets.fiber?.target)||30,mode:'minimum',unit:'g'},
  protein:{target:n(targets.protein?.target)||0,mode:'minimum',unit:'g'},
  saturated_fat:{target:n(targets.saturated_fat?.max??targets.saturated_fat?.target)||20,mode:'maximum',unit:'g'},
  sodium:{target:n(targets.sodium?.max??targets.sodium?.target)||2300,mode:'maximum',unit:'mg'},
  calories:{target:n(targets.calories?.target)||1700,mode:'balance',unit:'kcal'}
 };
 for(const [key,config] of Object.entries(configs)){
  const total=window.reduce((sum,day)=>sum+n(day[key]),0),expected=config.target*window.length;
  const balance=config.mode==='minimum'?total-expected:config.mode==='maximum'?expected-total:expected-total;
  result[key]={balance:round(balance,1),status:balance>=0?'credit':'debt',average:round(total/Math.max(1,window.length),1),target:config.target,unit:config.unit,days:window.length};
 }
 return result;
}

export function weeklyHealthForecast({days=[],weightHistory=[],targets={},currentWeight=null,goalWeight=null}={}){
 const recent=days.slice(-14);
 const calorieTarget=n(targets.calories?.target)||1700;
 const calorieAverage=avg(recent.map(day=>day.calories));
 const proteinConsistency=recent.length?recent.filter(day=>n(day.protein)>=n(targets.protein?.target)).length/recent.length*100:0;
 const fiberConsistency=recent.length?recent.filter(day=>n(day.fiber)>=n(targets.fiber?.target)).length/recent.length*100:0;
 const satConsistency=recent.length?recent.filter(day=>n(day.saturated_fat)<=n((targets.saturated_fat?.max??targets.saturated_fat?.target) ?? 20)).length/recent.length*100:0;
 const weights=weightHistory.slice(-30);
 let weeklyRate=0;
 if(weights.length>=2){const first=weights[0],last=weights.at(-1);const span=Math.max(1,(new Date(last.date)-new Date(first.date))/86400000);weeklyRate=(n(last.value)-n(first.value))/span*7;}
 const weight30=currentWeight==null?null:round(n(currentWeight)+weeklyRate*30/7,1);
 const direction=weeklyRate<-.1?'down':weeklyRate>.1?'up':'stable';
 const ldlDirection=fiberConsistency>=70&&satConsistency>=70?'improving':fiberConsistency<50||satConsistency<50?'needs attention':'stable';
 const calorieConsistency=recent.length?clamp(100-Math.abs(calorieAverage-calorieTarget)/Math.max(1,calorieTarget)*100):0;
 const goalProbability=goalWeight==null||currentWeight==null?null:clamp(direction==='down'?65+Math.min(30,Math.abs(weeklyRate)*15):35-Math.max(0,weeklyRate)*15);
 return {weight30,weightDirection:direction,weeklyWeightRate:round(weeklyRate,2),ldlDirection,proteinConsistency:round(proteinConsistency),fiberConsistency:round(fiberConsistency),calorieConsistency:round(calorieConsistency),goalProbability:goalProbability==null?null:round(goalProbability),confidence:clamp(35+recent.length*2+weights.length)};
}

export function buildDecisionTimeline({meals=[],activities=[],targets={}}={}){
 const events=[...meals.map(meal=>({id:`meal-${meal.id}`,at:meal.eaten_at,label:meal.food_name||'Meal',kind:'meal',nutrition:meal})),...activities.map(activity=>({id:`activity-${activity.id}`,at:activity.measured_at,label:activity.label||activity.metric_type,kind:'activity',activity}))].sort((a,b)=>new Date(a.at)-new Date(b.at));
 const running={fiber:0,protein:0,saturated_fat:0,calories:0};
 return events.map(event=>{
  let delta=0,reasons=[];
  if(event.kind==='meal'){
   const x=event.nutrition;running.fiber+=n(x.fiber);running.protein+=n(x.protein);running.saturated_fat+=n(x.saturated_fat);running.calories+=n(x.calories);
   delta+=Math.min(7,n(x.fiber)*.7)+Math.min(5,n(x.protein)*.08)-Math.max(0,n(x.saturated_fat)-4)*.7;
   if(n(x.fiber)>=5)reasons.push('fiber support');if(n(x.protein)>=25)reasons.push('protein support');if(n(x.saturated_fat)>8)reasons.push('high saturated fat');
  }else if(event.kind==='activity'){
   const steps=n(event.activity.value_primary);delta+=Math.min(8,steps/1000);reasons.push(`${Math.round(steps).toLocaleString()} steps`);
  }
  return {...event,delta:round(delta),scoreEffect:`${delta>=0?'+':''}${round(delta)}`,reason:reasons.join(' · ')||'neutral impact'};
 });
}

export function goalProbabilities({projection={},targets={},steps=0,stepTarget=10000,forecast={}}={}){
 const minProbability=(value,target)=>target>0?clamp(n(value)/n(target)*100):50;
 const maxProbability=(value,max)=>max>0?clamp(100-Math.max(0,n(value)-n(max))/n(max)*100):50;
 return {
  calories:maxProbability(projection.calories,n(targets.calories?.max??targets.calories?.target)||2100),
  protein:minProbability(projection.protein,n(targets.protein?.target)),
  fiber:minProbability(projection.fiber,n(targets.fiber?.target)||30),
  saturatedFat:maxProbability(projection.saturated_fat,n(targets.saturated_fat?.max??targets.saturated_fat?.target)||20),
  steps:minProbability(steps,stepTarget),
  weight:forecast.goalProbability??50
 };
}
