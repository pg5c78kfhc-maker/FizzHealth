const n=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const avg=a=>a.length?a.reduce((s,v)=>s+n(v),0)/a.length:null;
const dateMs=v=>{const t=new Date(v).getTime();return Number.isFinite(t)?t:null};
const days=(a,b)=>(dateMs(b)-dateMs(a))/86400000;

export function buildUnifiedHealthModel(input={}){
 const nutrition=input.nutrition||{}; const targets=input.targets||{}; const metrics=input.metrics||[];
 const latest={}; for(const row of [...metrics].sort((a,b)=>dateMs(b.measured_at)-dateMs(a.measured_at))) if(!latest[row.metric_type])latest[row.metric_type]=row;
 return {generatedAt:input.now||new Date().toISOString(),nutrition,targets,latestMetrics:latest,metrics,pantry:input.pantry||[],workouts:input.workouts||[],labs:input.labs||[],goals:input.goals||{},history:input.history||{}};
}

function goalScore(value,target,max,behavior='goal'){
 value=n(value); target=n(target); max=max==null?null:n(max);
 if(behavior==='limit') return max!=null?clamp(100-(Math.max(0,value-max)/Math.max(1,max))*100):clamp(100-value/Math.max(1,target)*100);
 return target>0?clamp(value/target*100):100;
}

export function adaptiveDailyHealthScore(model={}){
 const t=model.targets||{}, x=model.nutrition||{}, m=model.latestMetrics||{};
 const nutritionKeys=['protein','fiber','calories','saturated_fat','sodium'];
 const nutritionScores=nutritionKeys.map(k=>goalScore(x[k],t[k]?.target,t[k]?.max,t[k]?.behavior||(['saturated_fat','sodium'].includes(k)?'limit':'goal')));
 const nutrition=Math.round(avg(nutritionScores)??100);
 const activity=Math.round(goalScore(m.steps?.value_primary,model.goals?.steps||10000,null,'goal'));
 const recovery=m.sleep?Math.round(clamp(n(m.sleep.value_primary)/8*100)):70;
 const cardiovascular=Math.round(avg([
   m.blood_pressure?clamp(100-Math.max(0,n(m.blood_pressure.value_primary)-120)*2-Math.max(0,n(m.blood_pressure.value_secondary)-80)*2):75,
   m.resting_heart_rate?clamp(100-Math.max(0,n(m.resting_heart_rate.value_primary)-60)*1.5):75
 ])??75);
 const bodyComposition=m.weight&&model.goals?.weight?Math.round(clamp(100-Math.abs(n(m.weight.value_primary)-n(model.goals.weight))/Math.max(1,n(model.goals.weight))*100)):75;
 const overall=Math.round(nutrition*.35+activity*.2+recovery*.1+cardiovascular*.2+bodyComposition*.15);
 return {overall,domains:{nutrition,activity,recovery,cardiovascular,bodyComposition},confidence:Math.round(clamp(45+Object.keys(m).length*7+Object.keys(x).length*2)),generatedAt:model.generatedAt};
}

export function biomarkerOptimization(model={}){
 const x=model.nutrition||{}, t=model.targets||{}, metrics=model.latestMetrics||{}; const actions=[];
 const add=(id,label,impact,reason,domain='nutrition',direction='increase')=>actions.push({id,label,impact:Math.round(impact),reason,domain,direction});
 const fiberGap=Math.max(0,n(t.fiber?.target)-n(x.fiber)); if(fiberGap)add('fiber','Increase fiber',clamp(35+fiberGap*1.8),`${fiberGap.toFixed(0)} g remains toward today's fiber target.`,'cardiovascular');
 const satMax=n(t.saturated_fat?.max||t.saturated_fat?.target); if(satMax&&n(x.saturated_fat)>satMax)add('sat-fat','Stop saturated fat',clamp(65+(n(x.saturated_fat)-satMax)*3),'Saturated fat is above today’s limit.','cardiovascular','decrease');
 const proteinGap=Math.max(0,n(t.protein?.target)-n(x.protein)); if(proteinGap)add('protein','Add lean protein',clamp(30+proteinGap*.7),`${proteinGap.toFixed(0)} g remains to support muscle preservation.`,'bodyComposition');
 const stepsGap=Math.max(0,n(model.goals?.steps||10000)-n(metrics.steps?.value_primary)); if(stepsGap)add('steps','Take a walk',clamp(25+stepsGap/180),`${Math.round(stepsGap).toLocaleString()} steps remain today.`,'activity');
 const systolic=n(metrics.blood_pressure?.value_primary),diastolic=n(metrics.blood_pressure?.value_secondary); if(systolic>130||diastolic>80)add('bp','Choose a lower-sodium next meal',60,'Recent blood pressure supports reducing sodium exposure.','cardiovascular','decrease');
 return actions.sort((a,b)=>b.impact-a.impact);
}

export function personalizedDecisionEngine(model={}){
 const actions=biomarkerOptimization(model);
 const top=actions[0]||{id:'maintain',label:'Stay the course',impact:10,reason:'No urgent gap is currently detected.',domain:'overall',direction:'maintain'};
 return {...top,rank:1,whyNow:top.reason,expectedBenefit:`Estimated relative impact ${top.impact}/100`,alternatives:actions.slice(1,4),explanation:`${top.label} is ranked first because ${top.reason.toLowerCase()}`};
}

export function analyzeTrendsAndCorrelations({series={},minPoints=3}={}){
 const trends={};
 for(const [key,rows] of Object.entries(series)){
  const sorted=[...rows].filter(r=>dateMs(r.date??r.measured_at)!=null&&Number.isFinite(Number(r.value??r.value_primary))).sort((a,b)=>dateMs(a.date??a.measured_at)-dateMs(b.date??b.measured_at));
  if(sorted.length<2){trends[key]={direction:'unknown',slope:0,points:sorted.length};continue}
  const first=n(sorted[0].value??sorted[0].value_primary),last=n(sorted.at(-1).value??sorted.at(-1).value_primary),span=Math.max(1,days(sorted[0].date??sorted[0].measured_at,sorted.at(-1).date??sorted.at(-1).measured_at));
  const slope=(last-first)/span; trends[key]={direction:Math.abs(slope)<.01?'stable':slope>0?'up':'down',slope,points:sorted.length,change:last-first};
 }
 const correlations=[]; const keys=Object.keys(series);
 for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
  const a=new Map(series[keys[i]].map(r=>[String(r.date??r.local_date??'').slice(0,10),n(r.value??r.value_primary)]));
  const pairs=series[keys[j]].map(r=>[a.get(String(r.date??r.local_date??'').slice(0,10)),n(r.value??r.value_primary)]).filter(p=>Number.isFinite(p[0]));
  if(pairs.length<minPoints)continue; const ax=avg(pairs.map(p=>p[0])),ay=avg(pairs.map(p=>p[1])); let num=0,dx=0,dy=0; for(const [x,y] of pairs){num+=(x-ax)*(y-ay);dx+=(x-ax)**2;dy+=(y-ay)**2} const r=dx&&dy?num/Math.sqrt(dx*dy):0;
  correlations.push({a:keys[i],b:keys[j],coefficient:Math.round(r*100)/100,strength:Math.abs(r)>=.7?'strong':Math.abs(r)>=.4?'moderate':'weak',points:pairs.length});
 }
 return {trends,correlations:correlations.sort((a,b)=>Math.abs(b.coefficient)-Math.abs(a.coefficient))};
}

export function forecastGoal({current,target,history=[],direction='down',asOf=new Date()}={}){
 const sorted=[...history].filter(r=>Number.isFinite(Number(r.value??r.value_primary))&&dateMs(r.date??r.measured_at)!=null).sort((a,b)=>dateMs(a.date??a.measured_at)-dateMs(b.date??b.measured_at));
 if(sorted.length<2)return {status:'insufficient_data',forecastDate:null,daysRemaining:null,ratePerDay:0,confidence:20};
 const first=sorted[0],last=sorted.at(-1),span=Math.max(1,days(first.date??first.measured_at,last.date??last.measured_at)); const rate=(n(last.value??last.value_primary)-n(first.value??first.value_primary))/span;
 const remaining=n(target)-n(current); const movingCorrectly=direction==='down'?rate<0:rate>0;
 if(!movingCorrectly||rate===0)return {status:'off_track',forecastDate:null,daysRemaining:null,ratePerDay:rate,confidence:45};
 const daysRemaining=Math.max(0,remaining/rate); const forecastDate=new Date(new Date(asOf).getTime()+Math.ceil(daysRemaining)*86400000).toISOString().slice(0,10);
 return {status:'on_track',forecastDate,daysRemaining:Math.round(daysRemaining),ratePerDay:Math.round(rate*1000)/1000,confidence:clamp(45+sorted.length*4)};
}

export function buildHealthIntelligence(input={}){
 const model=buildUnifiedHealthModel(input); const score=adaptiveDailyHealthScore(model); const decision=personalizedDecisionEngine(model); const analysis=analyzeTrendsAndCorrelations(input.trendInput||{});
 const forecasts={}; for(const [key,g] of Object.entries(input.goalForecasts||{}))forecasts[key]=forecastGoal(g);
 const warnings=biomarkerOptimization(model).filter(a=>a.impact>=65).map(a=>({severity:a.impact>=85?'high':'medium',message:a.reason,action:a.label}));
 return {model,score,decision,actions:biomarkerOptimization(model),analysis,forecasts,warnings};
}
