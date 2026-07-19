const number=value=>Number.isFinite(Number(value))?Number(value):0;
const titleCase=value=>String(value||'').replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const sentence=value=>{const text=String(value||'').trim();return text&&!/[.!?]$/.test(text)?`${text}.`:text};
const round=value=>Math.round(number(value)*10)/10;

const TERMINOLOGY=Object.freeze({
 'sat fat':'saturated fat','saturated fat pressure':'saturated fat','fiber fit':'fiber','protein fit':'protein',
 'calorie fit':'calories','energy fit':'calories','step progress':'activity','steps progress':'activity',
 'menu recommendation tier':'menu guidance','pantry urgency':'pantry timing','expiration pressure':'pantry timing',
 'recent use pressure':'meal variety','nutrition coverage':'nutrition data completeness'
});

export function canonicalDecisionTerm(value){
 const raw=String(value||'').trim();
 const key=raw.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
 return TERMINOLOGY[key]||key||'general factor';
}

export function describeFactor(factor,{capitalize=false}={}){
 const impact=round(factor?.impact),term=canonicalDecisionTerm(factor?.label);
 const label=capitalize?titleCase(term):term;
 const direction=impact>0?'helpful':impact<0?'harmful':'neutral';
 const verb=direction==='helpful'?'helped':direction==='harmful'?'reduced':'did not change';
 return Object.freeze({label,term,impact,direction,text:`${label} ${verb} the result${impact?` by ${Math.abs(impact)} point${Math.abs(impact)===1?'':'s'}`:''}.`});
}

export function groupDecisionFactors(factors=[]){
 const groups=new Map();
 for(const factor of factors){
  const category=canonicalDecisionTerm(factor?.category||'general');
  if(!groups.has(category))groups.set(category,{category,label:titleCase(category),netImpact:0,factors:[]});
  const group=groups.get(category),impact=number(factor?.impact);
  group.netImpact+=impact;
  group.factors.push({...factor,label:describeFactor(factor,{capitalize:true}).label,impact,direction:impact>0?'helpful':impact<0?'harmful':'neutral'});
 }
 return [...groups.values()].map(group=>({...group,netImpact:round(group.netImpact)})).sort((a,b)=>Math.abs(b.netImpact)-Math.abs(a.netImpact)||a.label.localeCompare(b.label));
}

export function buildDecisionAudit(trace){
 const factors=Array.isArray(trace?.factors)?trace.factors:[];
 const factorImpact=factors.reduce((sum,factor)=>sum+number(factor?.impact),0);
 const displayedScore=number(trace?.score);
 const inferredBaseline=round(displayedScore-factorImpact);
 const groups=groupDecisionFactors(factors);
 return Object.freeze({
  subject:String(trace?.subjectName||trace?.subjectId||trace?.subject||'Decision'),
  decisionType:titleCase(trace?.type||'decision'),status:titleCase(trace?.status||'neutral'),
  displayedScore:Math.round(displayedScore),confidence:Math.round(number(trace?.confidence)),inferredBaseline,
  factorImpact:round(factorImpact),positiveImpact:round(factors.filter(f=>number(f?.impact)>0).reduce((sum,f)=>sum+number(f.impact),0)),
  negativeImpact:round(factors.filter(f=>number(f?.impact)<0).reduce((sum,f)=>sum+number(f.impact),0)),groups,
  factorCount:factors.length,dataSourceCount:Array.isArray(trace?.dataUsed)?trace.dataUsed.length:0,
  missingCount:Array.isArray(trace?.missing)?trace.missing.length:0,hasProjection:Boolean(trace?.projectedResult),
  hasComparison:Boolean(trace?.comparison),rank:trace?.rank??null
 });
}

function humanizeKey(key){return titleCase(String(key||'').replace(/_+/g,' '));}
function unitForKey(key){
 const value=String(key||'').toLowerCase();
 if(value.includes('percent')||value.includes('likelihood'))return '%';
 if(value.includes('calorie')||value.includes('kcal'))return ' kcal';
 if(value.includes('step'))return ' steps';
 if(value.includes('protein')||value.includes('fiber')||value.includes('fat'))return ' g';
 return '';
}
function formatProjectionValue(key,value){
 if(value==null)return '—';
 if(typeof value==='number')return `${round(value).toLocaleString()}${unitForKey(key)}`;
 if(typeof value==='object')return JSON.stringify(value);
 return String(value);
}

export function buildProjectionRows(projectedResult){
 if(!projectedResult||typeof projectedResult!=='object')return [];
 const entries=Object.entries(projectedResult),used=new Set(),rows=[];
 for(const [leftSuffix,rightSuffix] of [['before','after'],['current','projected']]){
  for(const [key,value] of entries){
   if(used.has(key)||!key.toLowerCase().endsWith(`_${leftSuffix}`))continue;
   const base=key.slice(0,-(`_${leftSuffix}`.length)),rightKey=`${base}_${rightSuffix}`;
   if(!(rightKey in projectedResult))continue;
   rows.push({key:base,label:humanizeKey(base),before:formatProjectionValue(base,value),after:formatProjectionValue(base,projectedResult[rightKey]),kind:'change'});
   used.add(key);used.add(rightKey);
  }
 }
 for(const [key,value] of entries){
  if(used.has(key)||key==='rankedActions'||key==='highestImpactAction')continue;
  rows.push({key,label:humanizeKey(key),value:formatProjectionValue(key,value),kind:'value'});
 }
 return rows;
}

export function buildConfidenceExplanation(trace){
 const confidence=Math.round(number(trace?.confidence)),missing=Array.isArray(trace?.missing)?trace.missing.filter(Boolean):[];
 const level=confidence>=85?'High':confidence>=65?'Moderate':'Low';
 const reason=trace?.confidenceReason?sentence(trace.confidenceReason):`${level} confidence is based on the completeness and reliability of the available evidence.`;
 const completeness=missing.length?`${missing.length} missing input${missing.length===1?'':'s'} reduced certainty: ${missing.join(', ')}.`:'No required information was recorded as missing.';
 return Object.freeze({confidence,level,reason,completeness,missing});
}

export function buildRankingExplanation(trace){
 if(trace?.comparison?.summary)return sentence(trace.comparison.summary);
 if(trace?.rank==null)return null;
 return trace.rank===1?'This was the highest-scoring option among the evaluated choices.':`This ranked #${trace.rank} because other evaluated choices scored higher on the same decision factors.`;
}

export function buildDecisionExplanation(trace){
 const audit=buildDecisionAudit(trace);
 const factors=(Array.isArray(trace?.factors)?trace.factors:[]).map(f=>({...f,impact:number(f?.impact)}));
 const positives=factors.filter(f=>f.impact>0).sort((a,b)=>b.impact-a.impact),negatives=factors.filter(f=>f.impact<0).sort((a,b)=>a.impact-b.impact);
 const primary=[...factors].sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))[0]||null;
 const scoreBand=audit.displayedScore>=75?'strong':audit.displayedScore>=50?'mixed':'weak';
 const primaryDescription=primary?describeFactor(primary,{capitalize:true}):null;
 const summary=`This is a ${scoreBand} ${audit.decisionType.toLowerCase()} result with a score of ${audit.displayedScore}. ${primaryDescription?primaryDescription.text:'No scored factor dominated this decision.'}`;
 const improvement=trace?.action?sentence(trace.action):negatives[0]?`Improve ${canonicalDecisionTerm(negatives[0].label)} to address the largest negative driver.`:'Maintain the current plan.';
 const confidence=buildConfidenceExplanation(trace);
 const factorView=f=>f?Object.freeze({...describeFactor(f,{capitalize:true})}):null;
 return Object.freeze({
  summary,primaryDriver:factorView(primary),strongestPositive:factorView(positives[0]),strongestNegative:factorView(negatives[0]),
  improvement,confidenceSummary:confidence.reason,completeness:confidence.completeness,confidenceLevel:confidence.level,
  projections:buildProjectionRows(trace?.projectedResult),comparison:buildRankingExplanation(trace)
 });
}

export function serializeDecisionTrace(trace){return JSON.stringify(trace,null,2);}
