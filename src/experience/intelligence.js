const n=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const isoTime=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?0:d.getTime()};

export function detectIntent(input=''){
 const text=String(input).trim(); const lower=text.toLowerCase();
 const time=(lower.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\b/)||[]);
 const quantity=(lower.match(/\b(?:bought|buy|ate|had|log)?\s*(\d+(?:\.\d+)?)\s*(g|grams?|oz|ounces?|cups?|servings?|items?|yogurts?)?\b/)||[]);
 let type='food';
 if(/blood pressure|\bbp\b|\d{2,3}\s*\/\s*\d{2,3}/.test(lower))type='blood_pressure';
 else if(/weight|weigh(?:ed)?|\blbs?\b|pounds?/.test(lower))type='weight';
 else if(/walk|ran|run|workout|gym|exercise|minutes?/.test(lower))type='workout';
 else if(/bought|purchase|pantry|restock/.test(lower))type='pantry';
 else if(/lab|ldl|hdl|a1c|apob|triglycer/.test(lower))type='lab';
 else if(/restaurant|reservation|dinner at|lunch at/.test(lower))type='restaurant';
 const bp=lower.match(/(\d{2,3})\s*\/\s*(\d{2,3})(?:\s*(?:hr|pulse|bpm)?\s*(\d{2,3}))?/);
 const duration=lower.match(/(\d+)\s*(?:minutes?|mins?)/);
 const weight=lower.match(/(\d{2,3}(?:\.\d+)?)\s*(?:lbs?|pounds?)/);
 return {type,text,confidence:clamp(text?(/\b(at|for|bought|walked|weight|bp|lab)\b/.test(lower)?88:68):0),entities:{time:time[1]?{hour:n(time[1]),minute:n(time[2]),meridiem:time[3]||null}:null,quantity:quantity[1]?n(quantity[1]):null,unit:quantity[2]||null,bloodPressure:bp?{systolic:n(bp[1]),diastolic:n(bp[2]),pulse:bp[3]?n(bp[3]):null}:null,durationMinutes:duration?n(duration[1]):null,weightLb:weight?n(weight[1]):null},reviewRequired:true};
}

export function rankActions({pantry=[],plannedMeals=[],captures=[],preventive=[],steps=0,stepTarget=10000,goals=[],now=new Date()}={}){
 const actions=[]; const day=86400000,nowMs=new Date(now).getTime();
 for(const p of pantry){const expiry=isoTime(p.expiration);const days=expiry?Math.ceil((expiry-nowMs)/day):null;if(days!=null&&days<=3&&String(p.on_hand).toLowerCase()!=='no')actions.push({id:`pantry-${p.pantry_id||p.id}`,type:'pantry',title:`Use ${p.item||p.name} next`,why:`${days<0?'Expired':days===0?'Expires today':`Expires in ${days} days`}`,priority:days<0?100:92-days*4,confidence:95,engines:['Pantry Intelligence'],evidence:[p.expiration]})}
 for(const m of plannedMeals.filter(x=>x.status==='planned'))actions.push({id:`meal-${m.id}`,type:'meal',title:`Log ${m.food_name||'planned meal'}`,why:'It is on today’s plan and has not been completed.',priority:82,confidence:98,engines:['Meal Planning'],evidence:[m.planned_local_date]});
 for(const c of captures.filter(x=>x.status==='review_required'))actions.push({id:`capture-${c.capture_id}`,type:'review',title:'Review AI meal',why:'An AI-derived meal is waiting for confirmation.',priority:90,confidence:n(c.confidence)||70,engines:['Restaurant Intelligence','Experience Orchestrator'],evidence:[c.created_at]});
 for(const p of preventive.filter(x=>!x.completed_at)){const days=Math.ceil((isoTime(p.due_date)-nowMs)/day);if(days<=30)actions.push({id:`care-${p.item_id}`,type:'preventive',title:`Schedule ${p.name}`,why:days<0?`Overdue by ${Math.abs(days)} days`:`Due in ${days} days`,priority:days<0?96:75,confidence:100,engines:['Preventive Care'],evidence:[p.due_date]})}
 if(stepTarget&&steps<stepTarget)actions.push({id:'steps-gap',type:'activity',title:`Walk ${Math.max(10,Math.ceil((stepTarget-steps)/125/5)*5)} minutes`,why:`${Math.round(stepTarget-steps).toLocaleString()} steps remain today.`,priority:70+clamp((stepTarget-steps)/stepTarget*20,0,20),confidence:85,engines:['Decision Intelligence','Health Intelligence'],evidence:[`${steps}/${stepTarget} steps`]});
 for(const g of goals.filter(x=>x.status==='needs_adjustment'))actions.push({id:`goal-${g.id}`,type:'goal',title:`Adjust ${g.name||g.id}`,why:'The recent trend is not moving toward the target.',priority:72,confidence:n(g.confidence)||60,engines:['Goal Intelligence'],evidence:g.factors||[]});
 return actions.sort((a,b)=>b.priority-a.priority).slice(0,8);
}

export function buildUnifiedTimeline(sources={}){
 const out=[];const add=(rows,type,dateKey,title,detail)=>{for(const r of rows||[]){const at=r[dateKey];if(!at)continue;out.push({id:`${type}-${r.id||r.event_id||r.pantry_id||r.receipt_id||out.length}`,type,eventAt:at,title:title(r),detail:detail(r),source:r})}};
 add(sources.meals,'meal','eaten_at',r=>r.food_name||'Meal',r=>`${n(r.calories)} kcal`);
 add(sources.metrics,'metric','measured_at',r=>String(r.metric_type||'Health metric').replaceAll('_',' '),r=>`${r.value_primary??''}${r.value_secondary!=null?`/${r.value_secondary}`:''} ${r.unit||''}`.trim());
 add(sources.pantryEvents,'pantry','event_at',r=>r.event_type||'Pantry update',r=>r.notes||r.source||'');
 add(sources.restaurantVisits,'restaurant','visited_at',r=>r.restaurant_name||'Restaurant visit',r=>r.items_json||'');
 add(sources.purchases,'purchase','purchased_at',r=>r.retailer||'Grocery purchase',r=>r.total!=null?`$${n(r.total).toFixed(2)}`:'');
 add(sources.healthEvents,'health','event_at',r=>r.title||r.event_type,r=>r.details_json||'');
 return out.sort((a,b)=>isoTime(b.eventAt)-isoTime(a.eventAt));
}

export function adaptiveNavigation(usage={},items=[]){
 const score=id=>n(usage[id]?.count)*4+n(usage[id]?.recent)*10;
 return [...items].sort((a,b)=>{if(a.id==='today')return -1;if(b.id==='today')return 1;return score(b.id)-score(a.id)}).map((x,index)=>({...x,rank:index+1,visible:true}));
}

export function explainRecommendation(item={}){
 return {why:item.why||item.explanation||'Recommended from current conditions and your recorded history.',engines:item.engines?.length?item.engines:['Experience Orchestrator'],confidence:clamp(n(item.confidence)||50),evidence:(item.evidence||[]).filter(Boolean).slice(0,5),historicalFactors:item.historicalFactors||[]};
}

export function buildNotifications({actions=[],permission='default'}={}){
 return actions.filter(a=>a.priority>=75).map(a=>({id:`notification-${a.id}`,title:a.title,body:a.why,priority:a.priority,action:{type:a.type,targetId:a.id},permission,status:'ready'}));
}

export function dashboardSummary({actions=[],nextMeal=null,risks=[],pantry=[],restaurantPlans=[],actual={},plan={}}={}){
 const variance={};for(const k of ['calories','protein','fiber','saturated_fat'])variance[k]=n(actual[k])-n(plan[k]);
 return {nextAction:actions[0]||null,nextMeal,risks:risks.slice(0,3),pantryAttention:pantry.slice(0,3),restaurantPlans:restaurantPlans.slice(0,3),variance,generatedAt:new Date().toISOString()};
}
