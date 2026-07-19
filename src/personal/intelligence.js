const n=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const daysBetween=(a,b)=>Math.max(0,(new Date(b)-new Date(a))/86400000);

export function buildPersonalKnowledge({meals=[],recommendations=[],restaurantVisits=[],purchases=[],workouts=[],goals=[]}={}){
 const counts=new Map(); const rejected=new Map(); const timing={};
 for(const m of meals){const key=String(m.food_name||m.name||'').trim();if(key)counts.set(key,(counts.get(key)||0)+1);const h=new Date(m.eaten_at||m.created_at||0).getHours();if(Number.isFinite(h))timing[h]=(timing[h]||0)+1}
 for(const r of recommendations){const key=String(r.item_name||r.title||'').trim();if(!key)continue;if(r.outcome==='accepted')counts.set(key,(counts.get(key)||0)+2);if(r.outcome==='rejected')rejected.set(key,(rejected.get(key)||0)+1)}
 const favoriteMeals=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=>({name,count,confidence:clamp(45+count*7)}));
 const avoidedFoods=[...rejected].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=>({name,count,confidence:clamp(50+count*10)}));
 const preferredMealHour=Object.entries(timing).sort((a,b)=>b[1]-a[1])[0]?.[0]??null;
 return {favoriteMeals,avoidedFoods,preferredMealHour:preferredMealHour==null?null:Number(preferredMealHour),restaurantFrequency:restaurantVisits.length,shoppingFrequency:purchases.length,exerciseFrequency:workouts.length,goals:goals.filter(g=>g.status!=='completed'),updatedAt:new Date().toISOString()};
}

export function learnPreferences(events=[],prior={}){
 const model=structuredClone(prior||{});model.preferences=model.preferences||{};model.learningEvents=n(model.learningEvents);
 for(const e of events){const key=String(e.subject||e.item_name||e.title||'unknown');const p=model.preferences[key]||{accepts:0,rejects:0,score:50,lastUpdated:null};if(e.outcome==='accepted'||e.type==='completed')p.accepts++;if(e.outcome==='rejected'||e.type==='dismissed')p.rejects++;p.score=clamp(50+(p.accepts-p.rejects)*12);p.confidence=clamp(30+(p.accepts+p.rejects)*10);p.lastUpdated=e.created_at||new Date().toISOString();model.preferences[key]=p;model.learningEvents++}
 model.updatedAt=new Date().toISOString();return model;
}

export function predictAdherence(recommendation={},context={}){
 let score=55;const factors=[];const pref=n(context.preferenceScore??50);score+=(pref-50)*.45;factors.push({factor:'preference fit',impact:Math.round((pref-50)*.45)});
 const complexity=n(recommendation.complexity??1);score-=Math.max(0,complexity-1)*8;factors.push({factor:'complexity',impact:-Math.max(0,complexity-1)*8});
 if(context.isWeekend){score+=(recommendation.location==='restaurant'?12:-5);factors.push({factor:'weekend pattern',impact:recommendation.location==='restaurant'?12:-5})}
 if(context.onHand){score+=14;factors.push({factor:'available now',impact:14})}if(context.previouslySuccessful){score+=16;factors.push({factor:'worked before',impact:16})}
 return {probability:clamp(Math.round(score)),confidence:clamp(45+n(context.observations)*4),factors:factors.sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))};
}

export function detectBehaviorPatterns({meals=[],restaurantVisits=[],purchases=[],workouts=[]}={}){
 const patterns=[];const weekend=rows=>rows.filter(r=>[0,6].includes(new Date(r.eaten_at||r.visited_at||r.purchased_at||r.started_at||0).getDay())).length;
 if(meals.length>=6){const ratio=weekend(meals)/meals.length;patterns.push({id:'weekend-eating',label:'Weekend eating pattern',strength:clamp(Math.round(Math.abs(ratio-.285)*140)),detail:`${Math.round(ratio*100)}% of recorded meals occur on weekends.`})}
 if(restaurantVisits.length>=2)patterns.push({id:'restaurant-frequency',label:'Restaurant rhythm',strength:clamp(45+restaurantVisits.length*5),detail:`${restaurantVisits.length} restaurant visits are available for learning.`});
 if(purchases.length>=2){const sorted=[...purchases].sort((a,b)=>new Date(a.purchased_at)-new Date(b.purchased_at));const gaps=sorted.slice(1).map((x,i)=>daysBetween(sorted[i].purchased_at,x.purchased_at));patterns.push({id:'grocery-cycle',label:'Grocery cycle',strength:clamp(50+gaps.length*6),detail:`Typical shopping interval is ${Math.round(gaps.reduce((a,b)=>a+b,0)/Math.max(1,gaps.length))} days.`})}
 if(workouts.length>=3)patterns.push({id:'exercise-routine',label:'Exercise routine',strength:clamp(50+workouts.length*4),detail:'Recurring exercise behavior is influencing adherence forecasts.'});
 return patterns.sort((a,b)=>b.strength-a.strength);
}

export function choosePersonalStrategy({adherence=50,pantryPressure=0,scheduleLoad=0,restaurantFrequency=0,goalRisk=0}={}){
 const candidates=[
  {id:'pantry-first',title:'Use pantry momentum',score:pantryPressure*.7+adherence*.2,why:'High-value food is already available and likely to be used.'},
  {id:'simplify',title:'Reduce plan complexity',score:(100-adherence)*.55+scheduleLoad*.45,why:'A simpler plan is more likely to survive a busy period.'},
  {id:'flexible-dining',title:'Plan restaurant flexibility',score:restaurantFrequency*.6+(100-adherence)*.25,why:'Planned flexibility can outperform unrealistic restriction.'},
  {id:'goal-focus',title:'Protect the highest-risk goal',score:goalRisk*.75+adherence*.15,why:'Current trend suggests one goal needs concentrated attention.'}
 ];return candidates.sort((a,b)=>b.score-a.score)[0];
}

export function adaptGoal(goal={},history={}){
 const adherence=n(history.adherence??50),progress=n(history.progressRate),confidence=clamp(n(history.confidence??50));let adjustment='keep',recommendedTarget=goal.target_value;
 if(adherence<45&&progress<=0){adjustment='reduce-complexity';recommendedTarget=goal.target_value;}
 else if(adherence>80&&progress>0){adjustment='maintain-or-accelerate'}
 return {...goal,adjustment,recommendedTarget,confidence,why:adjustment==='reduce-complexity'?'Adherence is the limiting factor, so change the path rather than abandon the goal.':'Current behavior supports the existing long-term direction.'};
}

export function searchPersonalMemory(memories=[],queryText=''){
 const terms=String(queryText).toLowerCase().split(/\s+/).filter(Boolean);return memories.map(m=>({...m,relevance:terms.reduce((s,t)=>s+(JSON.stringify(m).toLowerCase().includes(t)?1:0),0)})).filter(m=>!terms.length||m.relevance>0).sort((a,b)=>b.relevance-a.relevance||new Date(b.occurred_at)-new Date(a.occurred_at));
}

export function updateContinuousLearning(model={},event={}){
 const next=learnPreferences([event],model);next.lastEvent={type:event.type||'interaction',subject:event.subject||event.item_name||null,outcome:event.outcome||null,at:event.created_at||new Date().toISOString()};return next;
}

export function explainPersonalRecommendation(recommendation={},context={}){
 return {recommendation:recommendation.title||recommendation.name||'Personalized recommendation',why:recommendation.why||'Selected because it balances health impact with expected follow-through.',patterns:(context.patterns||[]).slice(0,4),previousOutcomes:(context.memories||[]).slice(0,3),confidence:clamp(n(recommendation.confidence??context.confidence??50)),engines:['Personal Knowledge','Preference Learning','Behavior','Adherence','Strategy'].filter(x=>!(context.disabledEngines||[]).includes(x))};
}

export function governPreference(preference={},action='inspect'){
 if(action==='remove')return {...preference,removed:true,active:false,updatedAt:new Date().toISOString()};if(action==='reset')return {...preference,accepts:0,rejects:0,score:50,confidence:0,history:[],updatedAt:new Date().toISOString()};return {...preference,active:preference.active!==false,provenance:preference.provenance||'Observed behavior',editable:true,removable:true};
}

export function personalContext(request={},state={}){
 const relevant=(state.preferences||[]).filter(p=>!request.domain||!p.domain||p.domain===request.domain);return {domain:request.domain||'general',preferences:relevant.slice(0,10),patterns:(state.patterns||[]).slice(0,6),memories:(state.memories||[]).slice(0,5),goals:(state.goals||[]).filter(g=>g.status!=='completed'),generatedAt:new Date().toISOString()};
}
