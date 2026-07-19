const n=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const mean=a=>a.length?a.reduce((s,v)=>s+n(v),0)/a.length:null;
const ms=v=>new Date(v).getTime();
const dateOf=r=>r.date||r.Date||r.local_date||r.measured_at||r.recorded_at||r.collected_at;
const valueOf=r=>n(r.value??r.Value??r.value_primary??r.result_value);

export function linearTrend(rows=[]){
 const clean=rows.filter(r=>Number.isFinite(ms(dateOf(r)))&&Number.isFinite(valueOf(r))).sort((a,b)=>ms(dateOf(a))-ms(dateOf(b)));
 if(clean.length<2)return {direction:'unknown',slopePerDay:0,change:0,points:clean.length,confidence:clamp(clean.length*12)};
 const x0=ms(dateOf(clean[0]));const xs=clean.map(r=>(ms(dateOf(r))-x0)/86400000),ys=clean.map(valueOf),xm=mean(xs),ym=mean(ys);
 let num=0,den=0;for(let i=0;i<xs.length;i++){num+=(xs[i]-xm)*(ys[i]-ym);den+=(xs[i]-xm)**2}
 const slope=den?num/den:0,change=ys.at(-1)-ys[0];
 return {direction:Math.abs(slope)<0.01?'stable':slope>0?'up':'down',slopePerDay:Math.round(slope*1000)/1000,change:Math.round(change*100)/100,points:clean.length,confidence:clamp(35+clean.length*5)};
}

export function longitudinalOverview({metrics=[],meals=[],labs=[],workouts=[]}={}){
 const groups={};for(const r of metrics){(groups[r.metric_type]??=[]).push(r)}
 const trends=Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,linearTrend(v)]));
 const nutritionByDay={};for(const m of meals){const d=String(m.consumed_local_date||m.eaten_at||'').slice(0,10);if(!d)continue;const x=nutritionByDay[d]??={date:d,calories:0,protein:0,fiber:0,saturated_fat:0,sodium:0};for(const k of ['calories','protein','fiber','saturated_fat','sodium'])x[k]+=n(m[k])}
 for(const key of ['calories','protein','fiber','saturated_fat','sodium'])trends[key]=linearTrend(Object.values(nutritionByDay).map(d=>({date:d,value:d[key]})));
 return {trends,coverage:{metricTypes:Object.keys(groups).length,metricReadings:metrics.length,mealDays:Object.keys(nutritionByDay).length,labs:labs.length,workouts:workouts.length},generatedAt:new Date().toISOString()};
}

export function biomarkerIntelligence({labs=[],targets={}}={}){
 const groups={};for(const r of labs){const key=String(r.biomarker||r.test_name||r.Test||r.test||r.metric_type||'').toLowerCase();if(key)(groups[key]??=[]).push(r)}
 return Object.entries(groups).map(([biomarker,rows])=>{const sorted=[...rows].sort((a,b)=>ms(dateOf(a))-ms(dateOf(b))),latest=valueOf(sorted.at(-1)),trend=linearTrend(sorted),target=n(targets[biomarker]);let daysToTarget=null;
  if(target&&trend.slopePerDay){const d=(target-latest)/trend.slopePerDay;if(d>=0&&Number.isFinite(d))daysToTarget=Math.round(d)}
  return {biomarker,latest,unit:sorted.at(-1)?.unit||'',trend,target:target||null,timeToTargetDays:daysToTarget,confidence:clamp(trend.confidence+(sorted.length>=3?10:0)),history:sorted};
 }).sort((a,b)=>a.biomarker.localeCompare(b.biomarker));
}

export function discoverCorrelations(series={},minPoints=5){
 const keys=Object.keys(series),out=[];
 for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
  const a=new Map(series[keys[i]].map(r=>[String(dateOf(r)).slice(0,10),valueOf(r)]));const pairs=series[keys[j]].map(r=>[a.get(String(dateOf(r)).slice(0,10)),valueOf(r)]).filter(p=>Number.isFinite(p[0]));if(pairs.length<minPoints)continue;
  const ax=mean(pairs.map(p=>p[0])),ay=mean(pairs.map(p=>p[1]));let num=0,dx=0,dy=0;for(const [x,y] of pairs){num+=(x-ax)*(y-ay);dx+=(x-ax)**2;dy+=(y-ay)**2}const r=dx&&dy?num/Math.sqrt(dx*dy):0;
  if(Math.abs(r)<0.4)continue;out.push({a:keys[i],b:keys[j],coefficient:Math.round(r*100)/100,strength:Math.abs(r)>=0.7?'strong':'moderate',points:pairs.length,explanation:`${keys[i]} and ${keys[j]} moved ${r>0?'together':'in opposite directions'} across ${pairs.length} matched days. This is an association, not proof of cause.`});
 }
 return out.sort((a,b)=>Math.abs(b.coefficient)-Math.abs(a.coefficient));
}

export function interventionImpact({name,startDate,before=[],after=[],outcome='outcome'}={}){
 const b=before.map(valueOf),a=after.map(valueOf),beforeAvg=mean(b),afterAvg=mean(a);if(beforeAvg==null||afterAvg==null)return {name,startDate,outcome,status:'insufficient_data',confidence:20};
 const change=afterAvg-beforeAvg,percent=beforeAvg?change/beforeAvg*100:0;return {name,startDate,outcome,status:'measured',beforeAverage:Math.round(beforeAvg*100)/100,afterAverage:Math.round(afterAvg*100)/100,change:Math.round(change*100)/100,percentChange:Math.round(percent*10)/10,confidence:clamp(35+Math.min(b.length,a.length)*6),explanation:`After ${name}, average ${outcome} changed by ${Math.abs(change).toFixed(1)} (${percent>=0?'+':''}${percent.toFixed(1)}%).`};
}

export function goalIntelligence({current,target,history=[],direction='down'}={}){
 const trend=linearTrend(history),remaining=n(target)-n(current),correct=direction==='down'?trend.slopePerDay<0:trend.slopePerDay>0;let days=null;if(correct&&trend.slopePerDay)days=Math.max(0,Math.round(remaining/trend.slopePerDay));
 const progress=direction==='down'?clamp(100-Math.abs(remaining)/Math.max(1,Math.abs(n(target)))*100):clamp(n(current)/Math.max(1,n(target))*100);
 return {progress:Math.round(progress),trend,daysToTarget:days,predictedDate:days!=null?new Date(Date.now()+days*86400000).toISOString().slice(0,10):null,confidence:clamp(trend.confidence),status:days!=null?'on_track':trend.points<2?'insufficient_data':'needs_adjustment',factors:[correct?'Recent trend is helping progress.':'Recent trend is not moving toward the target.',trend.points<7?'More observations will improve confidence.':'The forecast uses a meaningful history window.']};
}

export function preventiveStatus(items=[],asOf=new Date()){
 const now=ms(asOf);return items.map(x=>{const due=ms(x.due_date),days=Math.ceil((due-now)/86400000);return {...x,daysUntilDue:days,status:x.completed_at?'complete':days<0?'overdue':days<=30?'due_soon':'scheduled'}}).sort((a,b)=>(ms(a.due_date)||Infinity)-(ms(b.due_date)||Infinity));
}

export function explainableCoach({overview,biomarkers=[],correlations=[],goals=[]}={}){
 const insights=[];const wt=overview?.trends?.weight;if(wt?.points>=2)insights.push({title:`Weight trend is ${wt.direction}`,evidence:`${wt.points} readings show a ${Math.abs(wt.change).toFixed(1)} lb net change.`,confidence:wt.confidence});
 const fiber=overview?.trends?.fiber,sat=overview?.trends?.saturated_fat;if(fiber?.direction==='up')insights.push({title:'Fiber intake is improving',evidence:`Daily fiber trend is increasing by about ${Math.abs(fiber.slopePerDay).toFixed(2)} g/day across the observed period.`,confidence:fiber.confidence});
 if(sat?.direction==='down')insights.push({title:'Saturated fat exposure is declining',evidence:`The observed daily trend is down ${Math.abs(sat.slopePerDay).toFixed(2)} g/day.`,confidence:sat.confidence});
 for(const b of biomarkers.filter(x=>x.trend.points>=2).slice(0,2))insights.push({title:`${b.biomarker.toUpperCase()} is trending ${b.trend.direction}`,evidence:`Latest value ${b.latest}${b.unit?` ${b.unit}`:''}; ${b.trend.points} measurements support this direction.`,confidence:b.confidence});
 for(const c of correlations.slice(0,2))insights.push({title:`${c.a} relates to ${c.b}`,evidence:c.explanation,confidence:clamp(40+c.points*4)});
 if(!insights.length)insights.push({title:'Keep building your history',evidence:'More repeated measurements and complete nutrition days are needed before personal coaching can be supported by your own data.',confidence:25});
 return insights;
}

export function buildHealthIntelligence2(input={}){
 const overview=longitudinalOverview(input),biomarkers=biomarkerIntelligence({labs:input.labs,targets:input.biomarkerTargets}),correlations=discoverCorrelations(input.series||{},input.minCorrelationPoints||5),preventive=preventiveStatus(input.preventive||[],input.asOf),goals=Object.entries(input.goals||{}).map(([id,g])=>({id,...goalIntelligence(g)}));
 return {overview,biomarkers,correlations,preventive,goals,coach:explainableCoach({overview,biomarkers,correlations,goals}),generatedAt:new Date().toISOString()};
}
