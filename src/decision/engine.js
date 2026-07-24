const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const unique = values => [...new Set(values.filter(Boolean))];
export const ENGINE_VERSION = '1.4.11.20';
export const RULES_VERSION = '2026-07-20.1';

export const DECISION_TRACE_CONTRACT = Object.freeze({
  required: Object.freeze(['type','subject','subjectId','subjectName','score','confidence','status','rank','positive','negative','missing','factors','confidenceReason','methodology','action','inputs','dataUsed','projectedResult','comparison','engineVersion','rulesVersion','evaluatedAt']),
  arrays: Object.freeze(['positive','negative','missing','factors','dataUsed']),
  strings: Object.freeze(['type','subjectName','status','confidenceReason','methodology','action','engineVersion','rulesVersion','evaluatedAt'])
});

export function validateDecisionTrace(trace, {throwOnError = true} = {}) {
  const errors = [];
  if (!trace || typeof trace !== 'object' || Array.isArray(trace)) errors.push('Trace must be an object');
  else {
    for (const field of DECISION_TRACE_CONTRACT.required) if (!(field in trace)) errors.push(`Missing required field: ${field}`);
    for (const field of DECISION_TRACE_CONTRACT.arrays) if (!Array.isArray(trace[field])) errors.push(`${field} must be an array`);
    for (const field of DECISION_TRACE_CONTRACT.strings) if (typeof trace[field] !== 'string') errors.push(`${field} must be a string`);
    if (!Number.isFinite(trace.score)) errors.push('score must be a finite number');
    if (!Number.isFinite(trace.confidence)) errors.push('confidence must be a finite number');
    if (trace.rank !== null && (!Number.isInteger(trace.rank) || trace.rank < 1)) errors.push('rank must be null or a positive integer');
    if (trace.subjectId == null || String(trace.subjectId).trim() === '') errors.push('subjectId is required');
    if (Number.isNaN(Date.parse(trace.evaluatedAt))) errors.push('evaluatedAt must be an ISO-compatible date');
    for (const [index, factor] of (trace.factors || []).entries()) {
      if (!factor || typeof factor !== 'object') errors.push(`factors[${index}] must be an object`);
      else {
        if (typeof factor.label !== 'string' || !factor.label.trim()) errors.push(`factors[${index}].label is required`);
        if (!Number.isFinite(Number(factor.impact))) errors.push(`factors[${index}].impact must be numeric`);
        if (typeof factor.category !== 'string' || !factor.category.trim()) errors.push(`factors[${index}].category is required`);
      }
    }
  }
  const result = {valid: errors.length === 0, errors};
  if (!result.valid && throwOnError) throw new TypeError(`Invalid DecisionTrace: ${errors.join('; ')}`);
  return result;
}

export const DECISION_RULES = Object.freeze({
  nutrient: Object.freeze({gapWeight:75, lateDayMultiplier:1.25, lateDayBoost:55, eveningBoost:35, limitExceededBoost:110, limitCautionBoost:70}),
  chef: Object.freeze({baseEligibility:15, expires3Days:30, expires7Days:15, expiredPenalty:80, openWithExpiry:12, openWithoutExpiry:5, thawedPriority:18, frozenPenalty:6, lowQuantity:8, pantryPriority:7, recentPenalty:12, varietyBonus:7, proteinMax:28, fiberMax:22, lowSatFat:10, satFatHighPenalty:28, satFatModeratePenalty:14, calorieFitStrong:12, calorieFit:7, calorieExcessPenalty:25}),
  inventoryPressure: Object.freeze({expired:100, today:95, threeDays:82, sevenDays:62, fourteenDays:38, opened:14, thawed:22, refrigerated:6, lowServings:8, excessServingsMax:18, highWasteRisk:12, frozenRelief:12, unknownExpiryPenalty:10}),
  ldl: Object.freeze({base:55, fiberMax:24, satLowBonus:14, satModerateBonus:7, satNearLimitPenalty:8, activityMax:12, calorieFit:4, calorieExcessPenalty:8, sodiumPenalty:5, sugarPenalty:5, alcoholMaxPenalty:10}),
  maintenance: Object.freeze({minimumWeightRows:5, minimumMealDays:7, lookbackDays:30, caloriesPerPound:3500, minimumConfidence:20, maximumConfidence:92}),
  pantryMatch: Object.freeze({foodIdExact:1000, nameExact:600, tokenMatch:35, honeyMatch:150, roastMatch:120, unwantedButter:-500, unwantedPeanut:-100, nutritionKnown:40})
});

export function createDecisionTrace({
  type,
  subject,
  subjectId = null,
  subjectName = '',
  score,
  confidence,
  status = 'neutral',
  rank = null,
  positive = [],
  negative = [],
  missing = [],
  factors = [],
  confidenceReason = '',
  methodology = '',
  action = '',
  inputs = {},
  dataUsed = [],
  projectedResult = null,
  comparison = null,
  engineVersion = ENGINE_VERSION,
  rulesVersion = RULES_VERSION,
  evaluatedAt = new Date().toISOString()
}) {
  const trace = {
    type: String(type || ''),
    subject: subjectId ?? subject,
    subjectId: subjectId ?? subject,
    subjectName: subjectName || String(subject ?? ''),
    score: Math.round(clamp(score)),
    confidence: Math.round(clamp(confidence)),
    status: String(status || 'neutral'),
    rank,
    positive: unique(positive),
    negative: unique(negative),
    missing: unique(missing),
    factors: factors.map(factor => ({label:String(factor?.label || ''),impact:number(factor?.impact),category:String(factor?.category || 'general')})),
    confidenceReason: String(confidenceReason || ''),
    methodology: String(methodology || ''),
    action: String(action || ''),
    inputs: inputs && typeof inputs === 'object' && !Array.isArray(inputs) ? inputs : {},
    dataUsed: unique(dataUsed),
    projectedResult: projectedResult ?? null,
    comparison: comparison ?? null,
    engineVersion: String(engineVersion || ENGINE_VERSION),
    rulesVersion: String(rulesVersion || RULES_VERSION),
    evaluatedAt: String(evaluatedAt || new Date().toISOString())
  };
  validateDecisionTrace(trace);
  return Object.freeze(trace);
}

export function evaluateNutrient({definition, value = 0, planned = 0, target = 0, max = null, hour = new Date().getHours()}) {
  const projected = number(value) + number(planned);
  const behavior = definition.behavior || 'goal';
  const goal = number(target);
  const ceiling = max == null ? null : number(max);
  const dayProgress = clamp((hour - 6) / 16, .05, 1);
  const expectedPace = clamp(dayProgress, .05, 1);
  const actualPace = goal > 0 ? projected / goal : 0;
  const positive = [];
  const negative = [];
  const missing = [];
  let score = number(definition.priority);
  let status = 'neutral';
  let action = '';

  if (!goal && ceiling == null) missing.push('No configured target or maximum');

  if (behavior === 'goal') {
    const gap = goal > 0 ? Math.max(0, 1 - projected / goal) : 0;
    const paceDeficit=Math.max(0,expectedPace-actualPace);
    score += gap * DECISION_RULES.nutrient.gapWeight * (.35 + dayProgress * DECISION_RULES.nutrient.lateDayMultiplier);
    score += paceDeficit * 95;
    if (hour >= 19 && gap > .5) score += DECISION_RULES.nutrient.lateDayBoost;
    if (hour >= 21 && gap > .25) score += DECISION_RULES.nutrient.eveningBoost;

    if (goal <= 0) {
      status = 'neutral';
      action = `Configure a ${definition.label.toLowerCase()} goal.`;
    } else if (projected >= goal) {
      status = ceiling != null && projected > ceiling ? 'caution' : 'goal_met';
      positive.push('Daily goal reached');
      action = status === 'caution' ? `Avoid adding much more ${definition.label.toLowerCase()} today.` : 'Maintain the current plan.';
    } else {
      const remaining = Math.max(0, goal - projected);
      negative.push(`${Math.round(remaining * 10) / 10}${definition.unit === 'kcal' ? ' kcal' : definition.unit} remaining`);
      if (hour >= 19) negative.push('Limited time remains today');
      status = (dayProgress>=.65&&actualPace<expectedPace*.65)||(dayProgress>=.85&&gap>.2) ? 'urgent' : actualPace+0.08<expectedPace ? 'building' : 'on_track';
      action = `Choose a meal that adds ${definition.label.toLowerCase()}.`;
    }
  } else {
    const cap = ceiling && ceiling > 0 ? ceiling : goal || 1;
    const ratio = projected / cap;
    if (ratio >= 1) {
      score += DECISION_RULES.nutrient.limitExceededBoost;
      status = 'exceeded';
      negative.push('Configured limit reached or exceeded');
      action = `Avoid additional ${definition.label.toLowerCase()} today.`;
    } else if (ratio >= .8) {
      score += DECISION_RULES.nutrient.limitCautionBoost;
      status = 'caution';
      negative.push('Approaching the daily limit');
      action = `Keep the next meal low in ${definition.label.toLowerCase()}.`;
    } else {
      score += ratio * 30;
      status = 'on_track';
      positive.push('Within the configured limit');
      action = 'Maintain the current plan.';
    }
  }

  const configured = goal > 0 || ceiling != null;
  const confidence = configured ? (planned > 0 ? 94 : 97) : 55;
  const trace = createDecisionTrace({
      type: 'nutrient_priority',
      subject: definition.key,
      subjectId: definition.key,
      subjectName: definition.label,
      score,
      confidence,
      status,
      positive,
      negative,
      missing,
      methodology: behavior === 'goal' ? 'Priority increases with the remaining gap, expected time-of-day pace, health importance, planned intake, and declining recoverability before day-end.' : 'Priority increases as intake approaches or exceeds the configured limit.',
      action,
      dataUsed: ['Consumed nutrition', ...(planned > 0 ? ['Planned meals'] : []), 'Nutrient configuration', 'Current local time'],
      projectedResult: {current:number(value), planned:number(planned), projected, target:goal, max:ceiling},
      inputs: {value: number(value), planned: number(planned), projected, target: goal, max: ceiling, hour, behavior}
    });
  return Object.freeze({...trace, priorityScore: score});
}

export function rankNutrients({definitions, totals = {}, plannedTotals = {}, targets = {}, hour = new Date().getHours()}) {
  return definitions.map(definition => {
    const targetRow = targets[definition.key] || (definition.key === 'net_carbs' ? targets.carbs : null) || {};
    return {
      definition,
      decision: evaluateNutrient({
        definition: {...definition, behavior: targetRow.behavior || definition.behavior},
        value: totals[definition.key],
        planned: plannedTotals[definition.key],
        target: targetRow.target,
        max: targetRow.max,
        hour
      })
    };
  }).sort((a, b) => b.decision.priorityScore - a.decision.priorityScore || a.definition.label.localeCompare(b.definition.label));
}


export function evaluateInventoryPressure({candidate, horizonDays = 14, now = Date.now()}) {
  const rules=DECISION_RULES.inventoryPressure;
  const positive=[],negative=[],missing=[],factors=[];
  const quantity=Math.max(0,number(candidate.available_servings??candidate.quantity));
  const preferredFrequency=Math.max(0,number(candidate.preferred_servings_per_week??candidate.preferred_frequency));
  const expiration=Date.parse(candidate.expiration||'');
  const daysToExpiration=Number.isFinite(expiration)?(expiration-now)/86400000:null;
  const stateText=`${candidate.status||''} ${candidate.location||''} ${candidate.notes||''}`.toLowerCase();
  const thawed=/thaw(ed|ing)|defrost(ed|ing)/.test(stateText);
  const frozen=/freezer|frozen/.test(stateText)&&!thawed;
  const refrigerated=/refrigerator|fridge|chilled/.test(stateText);
  const opened=String(candidate.opened||'').toLowerCase()==='yes'||/\bopen(ed)?\b/.test(stateText);
  let score=0,status='low';
  if(daysToExpiration==null){missing.push('Expiration date');score-=rules.unknownExpiryPenalty;factors.push({label:'Unknown expiration date',impact:-rules.unknownExpiryPenalty,category:'data'});}
  else if(daysToExpiration<0){score=rules.expired;status='expired';negative.push('Past the recorded expiration date');factors.push({label:'Past expiration date',impact:rules.expired,category:'safety'});}
  else if(daysToExpiration<=1){score=rules.today;positive.push('Use immediately');factors.push({label:'Expires within 1 day',impact:rules.today,category:'expiration'});}
  else if(daysToExpiration<=3){score=rules.threeDays;positive.push('Use within 3 days');factors.push({label:'Expires within 3 days',impact:rules.threeDays,category:'expiration'});}
  else if(daysToExpiration<=7){score=rules.sevenDays;positive.push('Use this week');factors.push({label:'Expires within 7 days',impact:rules.sevenDays,category:'expiration'});}
  else if(daysToExpiration<=14){score=rules.fourteenDays;factors.push({label:'Expires within 14 days',impact:rules.fourteenDays,category:'expiration'});}
  if(opened){score+=rules.opened;positive.push('Open package');factors.push({label:'Open package pressure',impact:rules.opened,category:'state'});}
  if(thawed){score+=rules.thawed;positive.push('Thawed and should be used soon');factors.push({label:'Thawed inventory pressure',impact:rules.thawed,category:'state'});}
  else if(frozen){score-=rules.frozenRelief;negative.push('Frozen storage reduces immediate pressure');factors.push({label:'Frozen storage relief',impact:-rules.frozenRelief,category:'storage'});}
  else if(refrigerated){score+=rules.refrigerated;factors.push({label:'Refrigerated storage pressure',impact:rules.refrigerated,category:'storage'});}
  if(quantity>0&&quantity<=1.5){score+=rules.lowServings;positive.push('Low quantity remaining');factors.push({label:'Low servings remaining',impact:rules.lowServings,category:'quantity'});}
  const expectedUses=preferredFrequency>0?preferredFrequency*Math.max(1,number(horizonDays))/7:null;
  if(expectedUses!=null&&quantity>expectedUses){const excess=Math.min(rules.excessServingsMax,Math.round((quantity-expectedUses)*4));score+=excess;positive.push('More servings remain than the preferred cadence can consume');factors.push({label:'Serving surplus versus preferred frequency',impact:excess,category:'quantity'});}
  const wasteRisk=String(candidate.waste_risk||candidate.priority||'').toLowerCase();
  if(/high|urgent/.test(wasteRisk)){score+=rules.highWasteRisk;positive.push('High recorded waste risk');factors.push({label:'Recorded high waste risk',impact:rules.highWasteRisk,category:'waste'});}
  score=clamp(score);
  if(status!=='expired')status=score>=80?'critical':score>=60?'high':score>=35?'moderate':'low';
  const confidence=clamp(55+(daysToExpiration!=null?22:0)+(candidate.quantity!=null?10:0)+(candidate.status||candidate.location?7:0)+(candidate.opened!=null?4:0)-missing.length*8,35,98);
  const action=status==='expired'?'Do not recommend this item for consumption until its safety is reviewed.':score>=80?'Use this item in the next available meal.':score>=60?'Schedule this item within the next few days.':score>=35?'Include this item during the current planning horizon.':'No immediate inventory action is required.';
  return createDecisionTrace({type:'inventory_pressure',subject:candidate.pantry_id||candidate.food_id||candidate.item,subjectId:candidate.pantry_id||candidate.food_id||candidate.item,subjectName:candidate.item||candidate.name||'Inventory item',score,confidence,status,positive,negative,missing,factors,methodology:'Inventory pressure combines expiration proximity, open or thawed state, storage location, servings remaining, preferred serving cadence, and recorded waste risk. Expired inventory is treated as a safety exception rather than a consumption priority.',confidenceReason:missing.length?`Confidence is reduced because ${missing.join(' and ')} ${missing.length===1?'is':'are'} unavailable.`:'Expiration, quantity, and storage-state evidence are available.',action,inputs:{quantity,horizonDays:number(horizonDays),preferredFrequency,daysToExpiration,opened,thawed,frozen,refrigerated},dataUsed:['Pantry quantity','Expiration date','Open and thawed status','Storage location',...(preferredFrequency>0?['Preferred serving frequency']:[]),...(candidate.waste_risk||candidate.priority?['Recorded waste risk']:[])],projectedResult:{pressureScore:Math.round(score),daysToExpiration:daysToExpiration==null?null:Math.round(daysToExpiration*10)/10,servingsRemaining:quantity,expectedUses:expectedUses==null?null:Math.round(expectedUses*10)/10}});
}

export function scoreChefCandidate({candidate, remaining = {}, daily = {}, targets = {}, restaurantPossible = false, hour = new Date().getHours(), now = Date.now()}) {
  const calories = number(candidate.calories);
  const protein = number(candidate.protein);
  const fiber = number(candidate.fiber);
  const fat = number(candidate.fat);
  const saturatedFat = number(candidate.saturated_fat);
  const positive = [];
  const negative = [];
  const missing = [];
  const factors = [{label:'Base eligibility',impact:DECISION_RULES.chef.baseEligibility,category:'availability'}];
  let score = DECISION_RULES.chef.baseEligibility;
  const inventoryPressure = evaluateInventoryPressure({candidate, horizonDays:14, now});
  if (inventoryPressure.status !== 'expired') {
    const pressureImpact = Math.round(inventoryPressure.score * .28);
    if (pressureImpact) { score += pressureImpact; factors.push({label:'Inventory pressure',impact:pressureImpact,category:'waste'}); }
    if (inventoryPressure.score >= 60) positive.push('Inventory pressure favors using this item soon');
  }

  const proteinGap = Math.max(0, number(remaining.protein));
  const fiberGap = Math.max(0, number(remaining.fiber));
  const calorieRoom = Math.max(0, number(remaining.calories));
  const satTarget = number(targets.saturated_fat?.target || targets.saturated_fat?.max || 15);
  const satRemaining = Math.max(0, satTarget - number(daily.saturated_fat));

  const expiration = Date.parse(candidate.expiration || '');
  let daysToExpiration = null;
  if (Number.isFinite(expiration)) {
    daysToExpiration = (expiration - now) / 86400000;
    if (daysToExpiration < -1) {
      score -= DECISION_RULES.chef.expiredPenalty; factors.push({label:'Past expiration date',impact:-DECISION_RULES.chef.expiredPenalty,category:'safety'});
      negative.push('Past the recorded expiration date');
    } else if (daysToExpiration <= 3) {
      score += DECISION_RULES.chef.expires3Days; factors.push({label:'Expires within 3 days',impact:DECISION_RULES.chef.expires3Days,category:'waste'});
      positive.push('High waste-prevention priority');
    } else if (daysToExpiration <= 7) {
      score += DECISION_RULES.chef.expires7Days; factors.push({label:'Expires within 7 days',impact:DECISION_RULES.chef.expires7Days,category:'waste'});
      positive.push('Expiring soon');
    }
  } else missing.push('Expiration date');

  const stateText = `${candidate.status||''} ${candidate.location||''} ${candidate.notes||''}`.toLowerCase();
  const thawed = /thaw(ed|ing)|defrost(ed|ing)/.test(stateText);
  const frozen = /freezer|frozen/.test(stateText);
  if (thawed) {
    score += DECISION_RULES.chef.thawedPriority; factors.push({label:'Thawed and should be used soon',impact:DECISION_RULES.chef.thawedPriority,category:'waste'});
    positive.push('Thawed and ready to use');
  } else if (frozen) {
    score -= DECISION_RULES.chef.frozenPenalty; factors.push({label:'Requires thawing',impact:-DECISION_RULES.chef.frozenPenalty,category:'convenience'});
    negative.push('Requires thawing');
  }

  // Open status is useful context, but it cannot dominate nutrition without real waste risk.
  if (String(candidate.opened).toLowerCase() === 'yes') {
    const openImpact = daysToExpiration != null && daysToExpiration <= 7 ? 12 : 5;
    score += openImpact; factors.push({label:'Open package',impact:openImpact,category:'waste'});
    positive.push('Uses an open package');
  }

  const proteinImpact = proteinGap > 0 ? Math.min(28, Math.round(protein / Math.max(20, proteinGap) * 35)) : 4;
  if (proteinImpact > 0) { score += proteinImpact; factors.push({label:'Protein fit',impact:proteinImpact,category:'nutrition'}); }
  if (protein >= 20) positive.push('Strong protein contribution');
  else if (proteinGap > 30) negative.push('Limited protein contribution');

  const fiberImpact = fiberGap > 0 ? Math.min(22, Math.round(fiber / Math.max(8, fiberGap) * 32)) : 2;
  if (fiberImpact > 0) { score += fiberImpact; factors.push({label:'Fiber fit',impact:fiberImpact,category:'nutrition'}); }
  if (fiber >= 5) positive.push('Good fiber contribution');
  else if (fiberGap > 10) negative.push('Limited fiber contribution');

  if (saturatedFat <= Math.max(2, satRemaining * .2)) {
    score += 10; factors.push({label:'LDL-supportive saturated fat fit',impact:10,category:'ldl'});
    positive.push('Low saturated fat for today');
  } else if (saturatedFat > Math.max(5, satRemaining)) {
    score -= 28; factors.push({label:'Saturated fat pressure',impact:-28,category:'ldl'});
    negative.push('Would worsen today’s saturated-fat pressure');
  } else if (saturatedFat > 5) {
    score -= 14; factors.push({label:'Higher saturated fat',impact:-14,category:'ldl'});
    negative.push('Higher saturated fat');
  }

  if (calories <= calorieRoom) {
    const calorieImpact = calories <= Math.max(250, calorieRoom * .45) ? 12 : 7;
    score += calorieImpact; factors.push({label:'Fits remaining calories',impact:calorieImpact,category:'calories'});
  } else {
    score -= 25; factors.push({label:'Exceeds calorie budget',impact:-25,category:'calories'});
    negative.push('Exceeds remaining calorie budget');
  }

  if (restaurantPossible) {
    if (calories <= 350) { score += 16; factors.push({label:'Leaves room for restaurant meal',impact:16,category:'schedule'}); positive.push('Leaves room for dining out'); }
    if (fat > 15 || saturatedFat > 5) { score -= 14; factors.push({label:'Restaurant-day fat pressure',impact:-14,category:'schedule'}); }
  } else if (calories >= 250) { score += 4; factors.push({label:'Substantial home meal',impact:4,category:'schedule'}); }

  if (hour >= 17 && calories < 180) { score -= 8; factors.push({label:'Too light for the time of day',impact:-8,category:'time'}); negative.push('May be too light for the next meal'); }
  if (hour < 11 && calories > 650) { score -= 6; factors.push({label:'Heavy early-day choice',impact:-6,category:'time'}); }

  const quantity = number(candidate.quantity);
  if (quantity > 0 && quantity <= 1.5) { score += DECISION_RULES.chef.lowQuantity; factors.push({label:'Low quantity remaining',impact:DECISION_RULES.chef.lowQuantity,category:'waste'}); positive.push('Low quantity remaining'); }
  if (String(candidate.priority).toLowerCase().includes('high')) { score += DECISION_RULES.chef.pantryPriority; factors.push({label:'Pantry priority',impact:DECISION_RULES.chef.pantryPriority,category:'waste'}); positive.push('Marked as pantry priority'); }

  const lastConsumed = Date.parse(candidate.last_consumed || '');
  if (Number.isFinite(lastConsumed)) {
    const daysSince = (now - lastConsumed) / 86400000;
    if (daysSince < 1.5) { score -= DECISION_RULES.chef.recentPenalty; factors.push({label:'Recently consumed',impact:-DECISION_RULES.chef.recentPenalty,category:'variety'}); negative.push('Recently consumed'); }
    else if (daysSince > 7) { score += DECISION_RULES.chef.varietyBonus; factors.push({label:'Supports meal variety',impact:DECISION_RULES.chef.varietyBonus,category:'variety'}); positive.push('Adds variety'); }
  } else missing.push('Recent consumption history');

  const knownFields = [candidate.calories, candidate.protein, candidate.fiber, candidate.fat, candidate.saturated_fat]
    .filter(value => value != null && value !== '').length;
  const confidence = clamp(50 + knownFields * 8 + (candidate.expiration ? 6 : 0) + (candidate.quantity != null ? 4 : 0) - missing.length * 4, 40, 98);
  const action = negative.includes('Exceeds remaining calorie budget')
    ? 'Choose a smaller serving or a lower-calorie option.'
    : 'Open the item to review the serving, then consume or plan it.';

  return createDecisionTrace({
    type: 'chef_recommendation',
    subject: candidate.pantry_id || candidate.food_id || candidate.item,
    subjectId: candidate.pantry_id || candidate.food_id || candidate.item,
    subjectName: candidate.item || candidate.name || 'Food',
    score,
    confidence,
    status: score >= 80 ? 'strong' : score >= 55 ? 'good' : 'weak',
    positive,
    negative,
    missing,
    factors,
    methodology: 'The score balances verified pantry availability, nutrition fit, LDL support, calorie room, time of day, expiration and open/thawed pressure, quantity remaining, convenience, recent-use variety, and data confidence. Safety penalties override waste-prevention incentives.',
    confidenceReason: missing.length ? `Confidence is reduced because ${missing.join(' and ')} ${missing.length===1?'is':'are'} unavailable.` : 'Nutrition, pantry, timing, and recent-use inputs needed by this score are available.',
    action,
    dataUsed: ['Current consumed nutrition','Configured nutrient targets','Pantry availability','Quantity remaining','Open, frozen/thawed, and expiration status','Current local time',...(candidate.last_consumed?['Recent meal history']:[])],
    projectedResult: {
      caloriesRemaining: Math.max(0, calorieRoom-calories),
      proteinRemaining: Math.max(0, proteinGap-protein),
      fiberRemaining: Math.max(0, fiberGap-fiber),
      saturatedFatRemaining: Math.max(0, satRemaining-saturatedFat)
    },
    inputs: {calories, protein, fiber, fat, saturatedFat, quantity, remaining, daily, restaurantPossible, hour, daysToExpiration, inventoryPressure:inventoryPressure.score}
  });
}

export function rankChefRecommendations({candidates, remaining, daily = {}, targets = {}, restaurantPossible = false, hour = new Date().getHours(), now = Date.now(), limit = 4}) {
  const ranked = candidates.map(candidate => ({
    candidate,
    decision: scoreChefCandidate({candidate, remaining, daily, targets, restaurantPossible, hour, now})
  })).sort((a, b) => b.decision.score - a.decision.score || String(a.candidate.item).localeCompare(String(b.candidate.item)));
  return ranked.slice(0, limit).map((entry,index)=>({
    ...entry,
    decision:createDecisionTrace({...entry.decision,rank:index+1,comparison:index===0?{summary:'Highest-ranked option among the evaluated candidates.'}:{summary:`Ranked ${index+1} because higher-scoring options had a stronger combined nutrition, timing, or pantry fit.`}})
  }));
}


export function evaluateLDLSupport({totals = {}, targets = {}, coverage = 100, activity = {}}) {
  const fiber = number(totals.fiber);
  const saturatedFat = number(totals.saturated_fat);
  const calories = number(totals.calories);
  const sodium = number(totals.sodium);
  const addedSugar = number(totals.added_sugar);
  const alcohol = number(totals.alcohol);
  const steps = number(activity.steps);
  const stepTarget = number(activity.stepTarget) || 10000;
  const fiberTarget = number(targets.fiber?.target) || 30;
  const satLimit = number(targets.saturated_fat?.max ?? targets.saturated_fat?.target) || 15;
  const calorieTarget = number(targets.calories?.target) || 1700;
  const sodiumLimit = number(targets.sodium?.max ?? targets.sodium?.target) || 2300;
  const sugarLimit = number(targets.added_sugar?.max ?? targets.added_sugar?.target) || 36;

  const factors = [];
  const positive = [];
  const negative = [];
  const missing = [];
  let score = 55;

  const fiberImpact = Math.round(Math.min(24, fiber / fiberTarget * 24));
  score += fiberImpact; factors.push({label:'Fiber support', impact:fiberImpact, category:'nutrition'});
  if (fiber >= fiberTarget) positive.push('Fiber goal reached');
  else negative.push(`${Math.max(0, Math.round((fiberTarget-fiber)*10)/10)}g fiber remains`);

  const satRatio = saturatedFat / satLimit;
  const satImpact = satRatio <= .5 ? 14 : satRatio <= .8 ? 7 : satRatio <= 1 ? -8 : -Math.min(38, Math.round((satRatio-1)*28+14));
  score += satImpact; factors.push({label:'Saturated fat pressure', impact:satImpact, category:'nutrition'});
  if (satRatio <= .8) positive.push('Saturated fat remains controlled');
  else negative.push(satRatio > 1 ? 'Saturated fat limit exceeded' : 'Saturated fat is approaching the limit');

  const activityImpact = steps ? Math.round(Math.min(12, steps/stepTarget*12)) : 0;
  score += activityImpact; factors.push({label:'Activity support', impact:activityImpact, category:'activity'});
  if (steps >= stepTarget) positive.push('Daily step goal reached');
  if (!activity.stepsKnown) missing.push('Current step reading');

  if (calories > calorieTarget * 1.15) { score -= 8; factors.push({label:'Calorie excess',impact:-8,category:'energy'}); negative.push('Calories exceed the support range'); }
  else { score += 4; factors.push({label:'Calorie fit',impact:4,category:'energy'}); }
  if (sodium > sodiumLimit) { score -= 5; factors.push({label:'Sodium pressure',impact:-5,category:'nutrition'}); negative.push('Sodium exceeds the configured limit'); }
  if (addedSugar > sugarLimit) { score -= 5; factors.push({label:'Added sugar pressure',impact:-5,category:'nutrition'}); negative.push('Added sugar exceeds the configured limit'); }
  if (alcohol > 0) { const impact = -Math.min(10, Math.round(alcohol*3)); score += impact; factors.push({label:'Alcohol',impact,category:'behavior'}); negative.push('Alcohol reduces today’s LDL-support score'); }

  const confidence = clamp(number(coverage)*.72 + (activity.stepsKnown?10:0) + 16 - missing.length*5, 30, 98);
  const rankedActions = [
    {action:'Add a soluble-fiber-rich food.', benefit: fiber < fiberTarget ? Math.round((fiberTarget-fiber)/fiberTarget*24) : 0},
    {action:'Keep the next meal very low in saturated fat.', benefit: satRatio >= .8 ? Math.round(Math.min(38,satRatio*22)) : 0},
    {action:'Add a walk to increase activity support.', benefit: steps < stepTarget ? Math.round((stepTarget-steps)/stepTarget*12) : 0},
    {action:'Avoid more alcohol, added sugar, and high-sodium foods today.', benefit: (alcohol>0||addedSugar>sugarLimit||sodium>sodiumLimit)?8:0}
  ].sort((a,b)=>b.benefit-a.benefit);

  return createDecisionTrace({
    type:'ldl_support', subject:'today-ldl', subjectName:'LDL Support', score, confidence,
    status:score>=75?'strong':score>=50?'caution':'weak', positive, negative, missing, factors,
    methodology:'LDL Support combines fiber, saturated fat, activity, calories, sodium, added sugar, alcohol, and nutrition-data completeness. The score describes today’s supportive behaviors; it is not a clinical LDL measurement.',
    confidenceReason:coverage>=95?'Nutrition coverage is high; confidence is mainly limited by any missing activity or nutrient fields.':'Confidence is reduced by incomplete meal nutrition coverage.',
    action:rankedActions[0]?.benefit>0?rankedActions[0].action:'Maintain the current low-saturated-fat, fiber-forward plan.',
    inputs:{fiber_g:fiber,saturated_fat_g:saturatedFat,calories,sodium_mg:sodium,added_sugar_g:addedSugar,alcohol_servings:alcohol,steps,coverage_percent:coverage},
    dataUsed:['Consumed and planned nutrition','Configured nutrient targets','Current steps','Nutrition coverage'],
    projectedResult:{highestImpactAction:rankedActions[0], rankedActions},
    comparison:{summary:`The highest-value remaining action is estimated to improve support by about ${rankedActions[0]?.benefit||0} points.`}
  });
}

export function evaluateSteps({steps = 0, goal = 10000, hour = new Date().getHours(), typicalByHour = null, typicalRemaining = null, plannedExerciseSteps = 0, dataFresh = true, wakingEndHour = 22}) {
  steps=number(steps); goal=Math.max(1,number(goal)); plannedExerciseSteps=number(plannedExerciseSteps);
  const remainingHours=Math.max(1,wakingEndHour-hour);
  const remaining=Math.max(0,goal-steps-plannedExerciseSteps);
  const requiredPerHour=Math.round(remaining/remainingHours);
  const expectedRemaining=typicalRemaining==null ? Math.max(0, Math.round((goal/16)*remainingHours)) : number(typicalRemaining);
  const projected=steps+plannedExerciseSteps+expectedRemaining;
  const likelihood=steps>=goal?100:clamp(Math.round((projected/goal)*78 + Math.max(0,1-requiredPerHour/1200)*22),1,99);
  const missing=[]; if(typicalByHour==null)missing.push('Personal steps-by-time history'); if(typicalRemaining==null)missing.push('Typical remaining steps');
  const factors=[{label:'Goal completion',impact:Math.round(Math.min(60,steps/goal*60)),category:'progress'},{label:'Expected remaining activity',impact:Math.round(Math.min(30,expectedRemaining/goal*30)),category:'pace'},{label:'Planned exercise',impact:Math.round(Math.min(10,plannedExerciseSteps/goal*10)),category:'plan'}];
  const confidence=clamp((dataFresh?55:30)+(typicalByHour!=null?18:0)+(typicalRemaining!=null?18:0)+(plannedExerciseSteps?5:0),25,96);
  return createDecisionTrace({type:'steps',subject:'today-steps',subjectName:'Steps',score:likelihood,confidence,status:steps>=goal?'goal_met':likelihood>=70?'on_pace':likelihood>=40?'recoverable':'unlikely',positive:[...(steps>=goal?['Daily step goal reached']:[]),...(plannedExerciseSteps?['Planned activity is included']:[])],negative:steps<goal?[`${Math.round(remaining).toLocaleString()} steps remain after planned exercise`]:[],missing,factors,methodology:'Likelihood compares current progress, hours remaining, expected remaining activity, and planned exercise against the daily goal.',confidenceReason:missing.length?`Confidence will improve when ${missing.join(' and ')} are available.`:'Current progress and personal pace history are available.',action:steps>=goal?'Maintain normal activity.':`Average about ${requiredPerHour.toLocaleString()} steps per hour for the remaining ${remainingHours} hours.`,inputs:{current_steps:steps,goal_steps:goal,current_hour:hour,remaining_hours:remainingHours,planned_exercise_steps:plannedExerciseSteps,required_steps_per_hour:requiredPerHour,expected_remaining_steps:expectedRemaining},dataUsed:['Current step reading','Current local time',...(typicalByHour!=null?['Personal hourly step history']:[]),...(plannedExerciseSteps?['Planned exercise']:[])],projectedResult:{projected_steps:Math.round(projected),likelihood_percent:likelihood,steps_remaining:Math.round(remaining)}});
}


export function rankPantryFoodMatches({pantry, foods = []}) {
  const normalizeFoodName=value=>String(value||'').toLowerCase().replace(/^365\s+/,'').replace(/[^a-z0-9]+/g,' ').trim();
  const pantryName=normalizeFoodName(pantry?.item);
  const pantryTokens=new Set(pantryName.split(' ').filter(Boolean));
  const w=DECISION_RULES.pantryMatch;
  return foods.map(food=>{
    const name=normalizeFoodName(food.name),tokens=new Set(name.split(' ').filter(Boolean));
    let score=0;
    if(pantry?.food_id&&String(food.food_id).toUpperCase()===String(pantry.food_id).toUpperCase())score+=w.foodIdExact;
    if(name===pantryName)score+=w.nameExact;
    for(const token of pantryTokens)if(tokens.has(token))score+=w.tokenMatch;
    if(/honey/.test(pantryName)&&/honey/.test(name))score+=w.honeyMatch;
    if(/roast/.test(pantryName)&&/roast/.test(name))score+=w.roastMatch;
    if(!/butter/.test(pantryName)&&/butter/.test(name))score+=w.unwantedButter;
    if(!/peanut/.test(pantryName)&&/peanut/.test(name))score+=w.unwantedPeanut;
    const known=Number(food.nutrition_known)===1&&[food.calories,food.protein,food.carbs,food.fat,food.fiber].some(v=>number(v)>0);
    if(known)score+=w.nutritionKnown;
    const decision=createDecisionTrace({type:'pantry_match',subject:food.food_id||food.name,subjectId:food.food_id||food.name,subjectName:food.name||'Food match',score:clamp(score/10),confidence:score>=600?98:score>=150?82:score>0?65:35,status:score>=600?'exact':score>=150?'strong':score>0?'possible':'weak',positive:[...(score>=w.nameExact?['Name or identifier strongly matches']:[]),...(known?['Nutrition data is available']:[])],negative:[...(score<=0?['Little evidence links this food to the pantry item']:[])],missing:[...(pantry?.food_id?[]:['Pantry food identifier'])],factors:[{label:'Raw match score',impact:score,category:'matching'}],confidenceReason:score>=600?'An exact identifier or normalized-name match was found.':score>0?'Confidence reflects overlapping name tokens and nutrition availability.':'No reliable identifier or name match was found.',methodology:'Pantry matching compares food identifiers, normalized names, shared tokens, product-specific terms, and nutrition availability.',action:score>0?'Use the highest-ranked match after reviewing the food name.':'Review or link the pantry item manually.',inputs:{pantry_id:pantry?.food_id||null,pantry_name:pantry?.item||'',food_id:food.food_id||null,food_name:food.name||'',raw_match_score:score},dataUsed:['Pantry item identity','Food catalog identity','Nutrition availability'],projectedResult:{raw_match_score:score}});
    return {food,score,decision};
  }).sort((a,b)=>b.score-a.score||String(a.food.name).localeCompare(String(b.food.name))).map((entry,index)=>({...entry,decision:createDecisionTrace({...entry.decision,rank:index+1,comparison:{summary:index===0?'Highest-ranked catalog match for this pantry item.':`Ranked ${index+1} by identifier, normalized-name, token, and nutrition evidence.`}})}));
}

export function calculateMaintenanceEstimate({weights = [], mealDays = [], stepDays = []}) {
  const r=DECISION_RULES.maintenance;
  const byDate=new Map(mealDays.map(row=>[row.local_date,number(row.calories)]));
  const recentStepsAverage=stepDays.length?Math.round(stepDays.slice(-r.lookbackDays).reduce((sum,row)=>sum+number(row.steps),0)/Math.min(r.lookbackDays,stepDays.length)):null;
  if(weights.length<r.minimumWeightRows||mealDays.length<r.minimumMealDays){
    return {estimate:null,confidence:0,days:Math.min(weights.length,mealDays.length),averageCalories:null,weightChange:null,stepsAverage:recentStepsAverage,excludedDays:0};
  }
  const recent=weights.slice(-r.lookbackDays),first=recent[0],last=recent.at(-1);
  const spanDays=Math.max(1,(new Date(last.local_date)-new Date(first.local_date))/86400000);
  const change=number(last.value_primary)-number(first.value_primary);
  const dates=recent.map(row=>row.local_date).filter(date=>byDate.has(date));
  const average=dates.length?dates.reduce((sum,date)=>sum+byDate.get(date),0)/dates.length:0;
  if(!average)return {estimate:null,confidence:0,days:dates.length,averageCalories:null,weightChange:change,stepsAverage:null,excludedDays:recent.length-dates.length};
  const estimate=Math.round(average-(change*r.caloriesPerPound/spanDays));
  const confidence=clamp(Math.round(dates.length/r.lookbackDays*65+Math.min(20,spanDays/2)+(stepDays.length>=7?7:0)),r.minimumConfidence,r.maximumConfidence);
  const spread=Math.max(90,Math.round(300-confidence*2));
  const recentSteps=stepDays.filter(row=>dates.includes(row.local_date));
  const stepsAverage=recentSteps.length?Math.round(recentSteps.reduce((sum,row)=>sum+number(row.steps),0)/recentSteps.length):null;
  return {estimate,confidence,days:dates.length,lower:estimate-spread,upper:estimate+spread,averageCalories:Math.round(average),weightChange:Math.round(change*10)/10,stepsAverage,excludedDays:recent.length-dates.length};
}

export function evaluateMaintenance({estimate = null, lower = null, upper = null, confidence = 0, days = 0, averageCalories = null, weightChange = null, stepsAverage = null, excludedDays = 0}) {
  const available=number(estimate)>0;
  const missing=[]; if(days<7)missing.push('At least 7 usable overlapping days'); if(stepsAverage==null)missing.push('Average activity data');
  const factors=[]; if(averageCalories!=null)factors.push({label:'Average logged calories',impact:Math.round(number(averageCalories)),category:'energy'}); if(weightChange!=null)factors.push({label:'Weight-trend adjustment',impact:Math.round(number(estimate)-number(averageCalories)),category:'trend'}); if(stepsAverage!=null)factors.push({label:'Average steps context',impact:Math.round(number(stepsAverage)/1000),category:'activity'});
  return createDecisionTrace({type:'maintenance',subject:'maintenance-calories',subjectName:'Estimated Maintenance',score:available?number(estimate):0,confidence:available?confidence:0,status:available?'estimated':'learning',positive:available?[`${days} usable observation days`]:[],negative:excludedDays?[`${excludedDays} incomplete days excluded`]:[],missing,factors,methodology:'Maintenance is estimated from average logged energy intake adjusted by observed weight change. Activity and logging completeness are used to interpret confidence and the displayed range.',confidenceReason:available?`The estimate uses ${days} overlapping weight-and-calorie days${stepsAverage!=null?' plus activity context':''}.`:'There is not enough overlapping weight and calorie data for a responsible estimate.',action:available?'Continue complete meal, weight, and activity logging to narrow the range.':'Continue daily weight and complete meal logging.',inputs:{estimate_kcal:available?Math.round(number(estimate)):'learning',range_kcal:available?`${Math.round(number(lower))}-${Math.round(number(upper))}`:'unavailable',usable_days:days,average_calories:averageCalories,weight_change_lb:weightChange,average_steps:stepsAverage,excluded_days:excludedDays},dataUsed:['Meal calorie history','Weight history',...(stepsAverage!=null?['Step history']:[])],projectedResult:available?{maintenance_kcal:Math.round(number(estimate)),lower_kcal:Math.round(number(lower)),upper_kcal:Math.round(number(upper))}:null});
}

export function scoreRestaurantCandidate({meal, remaining = {}, daily = {}, targets = {}}) {
  const protein=number(meal.protein), fiber=number(meal.fiber), sat=number(meal.saturated_fat), calories=number(meal.calories);
  const tier=String(meal.recommendation_tier||'').toLowerCase(); const factors=[],positive=[],negative=[],missing=[]; let score=45;
  const tierImpact=tier.includes('best')||tier.includes('support')?22:tier.includes('reasonable')?10:tier.includes('treat')?-12:tier.includes('avoid')?-28:0;
  score+=tierImpact; if(tierImpact)factors.push({label:'Menu recommendation tier',impact:tierImpact,category:'menu'});
  const pImpact=Math.min(20,Math.round(protein/Math.max(20,number(remaining.protein)||20)*28)); score+=pImpact; factors.push({label:'Protein fit',impact:pImpact,category:'nutrition'});
  const fImpact=Math.min(14,Math.round(fiber/Math.max(8,number(remaining.fiber)||8)*20)); score+=fImpact; factors.push({label:'Fiber fit',impact:fImpact,category:'nutrition'});
  const satLimit=number(targets.saturated_fat?.max??targets.saturated_fat?.target)||15, satRemaining=Math.max(0,satLimit-number(daily.saturated_fat));
  if(sat>satRemaining){score-=24;factors.push({label:'Saturated fat pressure',impact:-24,category:'ldl'});negative.push('Would exceed remaining saturated-fat room')}else if(sat<=3){score+=10;factors.push({label:'Low saturated fat',impact:10,category:'ldl'});positive.push('LDL-supportive saturated-fat profile')}
  if(calories<=number(remaining.calories)){score+=10;factors.push({label:'Fits calorie budget',impact:10,category:'energy'})}else{score-=20;factors.push({label:'Exceeds calorie budget',impact:-20,category:'energy'});negative.push('Exceeds remaining calories')}
  if(meal.confidence==null)missing.push('Nutrition-estimate confidence'); if(!meal.serving_description)missing.push('Exact serving size'); if(!meal.preparation)missing.push('Preparation details');
  const confidence=clamp((meal.confidence==null?55:number(meal.confidence)*100)-missing.length*5,35,96);
  return createDecisionTrace({type:'restaurant_recommendation',subject:meal.id||meal.meal_name,subjectId:meal.id||meal.meal_name,subjectName:meal.meal_name||'Restaurant meal',score,confidence,status:score>=75?'recommended':score>=50?'reasonable':'limit',positive,negative,missing,factors,methodology:'Restaurant meals use the same decision platform as home foods: current protein, fiber, calories, saturated-fat pressure, menu tier, and source confidence.',confidenceReason:missing.length?`Confidence is reduced because ${missing.join(', ')} are unavailable.`:'Menu evidence, preparation, serving size, and nutrition confidence are available.',action:score>=75?'A strong current-day option. Review the serving, then plan or consume it.':score>=50?'Reasonable, but review the tradeoffs before consuming.':'Choose a higher-scoring option when practical.',inputs:{calories,protein_g:protein,fiber_g:fiber,saturated_fat_g:sat,remaining,daily,source:meal.source||'manual'},dataUsed:['Saved restaurant menu record','Current nutrition totals','Configured targets',meal.source==='ai_exchange'?'AI-estimated nutrition':'Saved nutrition'],projectedResult:{calories_remaining:Math.max(0,number(remaining.calories)-calories),protein_remaining:Math.max(0,number(remaining.protein)-protein),fiber_remaining:Math.max(0,number(remaining.fiber)-fiber),saturated_fat_remaining:Math.max(0,satRemaining-sat)}});
}



export function buildForwardMealPlan({candidates = [], days = 15, startDate = new Date(), mealsPerDay = 1, targets = {}, now = Date.now()}) {
  const horizon=Math.max(1,Math.min(30,Math.round(number(days)||15)));
  const slotsPerDay=Math.max(1,Math.min(3,Math.round(number(mealsPerDay)||1)));
  const eligible=(Array.isArray(candidates)?candidates:[]).filter(candidate=>{
    const expiration=Date.parse(candidate.expiration||'');
    const expired=Number.isFinite(expiration)&&expiration<now-86400000;
    return !expired && String(candidate.on_hand??'Yes').toLowerCase()!=='no' && number(candidate.quantity)>0 && (number(candidate.calories)>0||number(candidate.protein)>0||number(candidate.fiber)>0);
  }).map((candidate,index)=>({
    candidate,
    key:String(candidate.pantry_id||candidate.recipe_id||candidate.food_id||candidate.item||candidate.name||index),
    remaining:Math.max(1,Math.floor(number(candidate.available_servings??candidate.quantity)||1)),
    used:0,
    lastDay:-99
  }));
  const totalSlots=horizon*slotsPerDay;
  const plan=[];
  const start=new Date(startDate); start.setHours(12,0,0,0);
  for(let slot=0;slot<totalSlots;slot++){
    const dayIndex=Math.floor(slot/slotsPerDay);
    const day=new Date(start); day.setDate(start.getDate()+dayIndex);
    const remaining={calories:number(targets.calories?.target)||1700,protein:number(targets.protein?.target)||0,fiber:number(targets.fiber?.target)||0};
    let available=eligible.filter(x=>x.remaining>0);
    if(!available.length)break;
    const previousKey=plan.at(-1)?.candidate ? String(plan.at(-1).candidate.pantry_id||plan.at(-1).candidate.recipe_id||plan.at(-1).candidate.food_id||plan.at(-1).candidate.item||plan.at(-1).candidate.name||'') : '';
    const alternatives=available.filter(x=>x.key!==previousKey);
    if(alternatives.length)available=alternatives;
    const ranked=available.map(x=>{
      const decision=scoreChefCandidate({candidate:x.candidate,remaining,daily:{},targets,restaurantPossible:false,hour:12,now:day.getTime()});
      const varietyPenalty=x.lastDay===dayIndex?-35:Math.max(0,4-(dayIndex-x.lastDay))*5;
      const usagePenalty=x.used*3;
      const pressure=evaluateInventoryPressure({candidate:{...x.candidate,available_servings:x.remaining},horizonDays:horizon,now:day.getTime()});
      const pressureBoost=Math.round(pressure.score*.35);
      return {x,decision,pressure,planningScore:decision.score-varietyPenalty-usagePenalty+pressureBoost};
    }).sort((a,b)=>b.planningScore-a.planningScore||a.x.used-b.x.used||a.x.key.localeCompare(b.x.key));
    const selected=ranked[0];
    selected.x.remaining--; selected.x.used++; selected.x.lastDay=dayIndex;
    plan.push(Object.freeze({
      date:day.toISOString().slice(0,10),
      mealIndex:(slot%slotsPerDay)+1,
      candidate:selected.x.candidate,
      decision:selected.decision,
      inventoryPressure:selected.pressure,
      planningScore:Math.round(selected.planningScore),
      serving:1
    }));
  }
  const availableServings=eligible.reduce((sum,x)=>sum+x.remaining+x.used,0);
  const coveredDays=plan.length?new Set(plan.map(x=>x.date)).size:0;
  const summary=Object.freeze({days:horizon,mealsPerDay:slotsPerDay,totalSlots,plannedSlots:plan.length,coveredDays,coveragePercent:Math.round(plan.length/totalSlots*100),availableServings,runoutDate:plan.length<totalSlots?(plan.at(-1)?.date||start.toISOString().slice(0,10)):null});
  return Object.freeze({plan:Object.freeze(plan),summary});
}

export function evaluateDecision(type, payload) {
  const evaluators={nutrient:evaluateNutrient,nutrients:rankNutrients,ldl:evaluateLDLSupport,steps:evaluateSteps,maintenance:evaluateMaintenance,maintenance_estimate:calculateMaintenanceEstimate,chef:scoreChefCandidate,chef_rank:rankChefRecommendations,restaurant:scoreRestaurantCandidate,pantry_match:rankPantryFoodMatches,simulation:simulateDecisionScenario,comparison:compareDecisionScenarios,forward_plan:buildForwardMealPlan,inventory_pressure:evaluateInventoryPressure};
  if(!evaluators[type])throw new Error(`Unsupported decision type: ${type}`);
  return evaluators[type](payload);
}

const addTotals=(base={},delta={})=>Object.fromEntries(new Set([...Object.keys(base),...Object.keys(delta)]).values().map(k=>[k,number(base[k])+number(delta[k])]));
export function simulateDecisionScenario({scenario, totals = {}, plannedTotals = {}, targets = {}, definitions = [], steps = {}, coverage = 100}) {
  const nutrientKeys=['calories','protein','carbs','fat','fiber','saturated_fat','sodium','added_sugar','alcohol'];
  const cleanNutrition=value=>Object.fromEntries(nutrientKeys.map(key=>[key,number(value?.[key])]).filter(([,value])=>value!==0));
  const added=cleanNutrition(scenario?.nutritionDelta);
  const removed=cleanNutrition(scenario?.removeNutrition);
  const nutritionDelta=Object.fromEntries(nutrientKeys.map(key=>[key,number(added[key])-number(removed[key])]).filter(([,value])=>value!==0));
  const simulatedTotals=addTotals(totals,nutritionDelta);
  const simulatedSteps=number(steps.current)+number(scenario?.additionalSteps);
  const beforeNutrients=rankNutrients({definitions,totals,plannedTotals,targets,hour:scenario?.hour});
  const afterNutrients=rankNutrients({definitions,totals:simulatedTotals,plannedTotals,targets,hour:scenario?.hour});
  const beforeLDL=evaluateLDLSupport({totals:addTotals(totals,plannedTotals),targets,coverage,activity:{steps:steps.current,stepTarget:steps.goal,stepsKnown:steps.known}});
  const afterLDL=evaluateLDLSupport({totals:addTotals(simulatedTotals,plannedTotals),targets,coverage,activity:{steps:simulatedSteps,stepTarget:steps.goal,stepsKnown:steps.known||number(scenario?.additionalSteps)>0}});
  const beforeSteps=evaluateSteps({steps:steps.current,goal:steps.goal,hour:scenario?.hour,typicalByHour:steps.typicalByHour,typicalRemaining:steps.typicalRemaining,plannedExerciseSteps:steps.plannedExerciseSteps});
  const afterSteps=evaluateSteps({steps:simulatedSteps,goal:steps.goal,hour:scenario?.hour,typicalByHour:steps.typicalByHour,typicalRemaining:steps.typicalRemaining,plannedExerciseSteps:steps.plannedExerciseSteps});
  const labelMap={calories:'Calories',protein:'Protein',carbs:'Carbohydrates',fat:'Fat',fiber:'Fiber',saturated_fat:'Saturated fat',sodium:'Sodium',added_sugar:'Added sugar',alcohol:'Alcohol'};
  const unitMap={calories:'kcal',protein:'g',carbs:'g',fat:'g',fiber:'g',saturated_fat:'g',sodium:'mg',added_sugar:'g',alcohol:'servings'};
  const nutrientImpacts=nutrientKeys.filter(key=>number(nutritionDelta[key])!==0).map(key=>{
    const before=number(totals[key])+number(plannedTotals[key]);
    const after=before+number(nutritionDelta[key]);
    const target=targets[key]||{};
    const limit=target.max??(key==='saturated_fat'||key==='sodium'||key==='added_sugar'||key==='alcohol'?target.target:null);
    const goal=target.target;
    const behavior=limit!=null?'limit':'goal';
    const remainingBefore=behavior==='limit'?number(limit)-before:number(goal)-before;
    const remainingAfter=behavior==='limit'?number(limit)-after:number(goal)-after;
    let status='neutral';
    if(behavior==='limit') status=after>number(limit)?'exceeded':after>number(limit)*.85?'near_limit':'within_limit';
    else if(goal) status=after>=number(goal)?'goal_met':after>before?'improved':'unchanged';
    return {key,label:labelMap[key],unit:unitMap[key],before,after,delta:number(nutritionDelta[key]),behavior,target:goal??null,max:limit??null,remainingBefore,remainingAfter,status};
  });
  const suggestions=[];
  const sat=nutrientImpacts.find(x=>x.key==='saturated_fat');
  const calories=nutrientImpacts.find(x=>x.key==='calories');
  const fiber=nutrientImpacts.find(x=>x.key==='fiber');
  const protein=nutrientImpacts.find(x=>x.key==='protein');
  const sodium=nutrientImpacts.find(x=>x.key==='sodium');
  if(sat?.status==='exceeded')suggestions.push(`Reduce saturated fat by at least ${Math.ceil(Math.abs(sat.remainingAfter))} g.`);
  if(calories?.status==='exceeded')suggestions.push(`Reduce the meal by about ${Math.ceil(Math.abs(calories.remainingAfter)/25)*25} kcal.`);
  if(sodium?.status==='exceeded')suggestions.push(`Reduce sodium by at least ${Math.ceil(Math.abs(sodium.remainingAfter)/50)*50} mg.`);
  if(fiber&&fiber.delta<5&&number(targets.fiber?.target)>fiber.after)suggestions.push('Add a high-fiber side or ingredient.');
  if(protein&&protein.delta<20&&number(targets.protein?.target)>protein.after)suggestions.push('Add a lean protein source.');
  if(number(scenario?.additionalSteps)>0&&afterSteps.score<75)suggestions.push('A longer walk would further improve step-goal likelihood.');
  const result={scenario:{...scenario,label:scenario?.label||'Simulation',mode:scenario?.mode||'meal',nutritionDelta,removeNutrition:removed},before:{nutrients:beforeNutrients,ldl:beforeLDL,steps:beforeSteps},after:{nutrients:afterNutrients,ldl:afterLDL,steps:afterSteps},delta:{ldl:afterLDL.score-beforeLDL.score,stepsLikelihood:afterSteps.score-beforeSteps.score,...nutritionDelta,saturatedFat:number(nutritionDelta.saturated_fat)},nutrientImpacts,suggestions:unique(suggestions).slice(0,3),actualDataChanged:false,evaluatedAt:new Date().toISOString(),engineVersion:ENGINE_VERSION,rulesVersion:RULES_VERSION};
  const totalDecisionDelta=result.delta.ldl+result.delta.stepsLikelihood/2;
  result.trace=createDecisionTrace({type:'simulation',subject:scenario?.id||'what-if',subjectName:result.scenario.label,score:clamp(50+totalDecisionDelta),confidence:Math.round((beforeLDL.confidence+beforeSteps.confidence)/2),status:totalDecisionDelta>1?'improves':totalDecisionDelta<-1?'worsens':'tradeoff',positive:[...(result.delta.ldl>0?[`LDL Support improves by ${result.delta.ldl} points`]:[]),...(result.delta.stepsLikelihood>0?[`Step-goal likelihood improves by ${result.delta.stepsLikelihood} points`]:[]),...nutrientImpacts.filter(x=>x.behavior==='goal'&&x.delta>0).map(x=>`${x.label} increases by ${Math.round(x.delta)} ${x.unit}`)],negative:[...(result.delta.ldl<0?[`LDL Support decreases by ${Math.abs(result.delta.ldl)} points`]:[]),...(result.delta.stepsLikelihood<0?[`Step-goal likelihood decreases by ${Math.abs(result.delta.stepsLikelihood)} points`]:[]),...nutrientImpacts.filter(x=>x.status==='exceeded').map(x=>`${x.label} exceeds the configured limit by ${Math.round(Math.abs(x.remainingAfter))} ${x.unit}`)],missing:unique([...beforeLDL.missing,...beforeSteps.missing]),factors:[{label:'LDL Support change',impact:result.delta.ldl,category:'ldl'},{label:'Step likelihood change',impact:result.delta.stepsLikelihood,category:'activity'},...nutrientImpacts.map(x=>({label:`${x.label} change`,impact:Math.round((x.behavior==='limit'?-1:1)*x.delta),category:'nutrition'}))],methodology:'The simulator clones the current decision context in memory, optionally removes a replaced item, applies hypothetical nutrition and activity changes, and reruns the same decision engine without writing to the database.',confidenceReason:'Simulation confidence is inherited from the real data used by the underlying LDL, nutrient, and step decisions.',action:result.suggestions[0]||'Review the before-and-after changes. Close the simulation to discard it; no actual records are changed.',inputs:{scenario_mode:result.scenario.mode,added_nutrition:added,removed_nutrition:removed,net_nutrition_delta:nutritionDelta,additional_steps:number(scenario?.additionalSteps)},dataUsed:['Current nutrition totals','Planned meals','Configured targets','Current steps'],projectedResult:{ldl_before:beforeLDL.score,ldl_after:afterLDL.score,steps_before:beforeSteps.score,steps_after:afterSteps.score,top_priority_before:beforeNutrients[0]?.definition?.label,top_priority_after:afterNutrients[0]?.definition?.label,...Object.fromEntries(nutrientImpacts.flatMap(x=>[[`${x.key}_before`,x.before],[`${x.key}_after`,x.after]]))}});
  return result;
}


export function compareDecisionScenarios({scenarios = [], totals = {}, plannedTotals = {}, targets = {}, definitions = [], steps = {}, coverage = 100}) {
  if(!Array.isArray(scenarios) || scenarios.length < 2) throw new TypeError('At least two scenarios are required for comparison');
  const evaluated=scenarios.map((scenario,index)=>{
    const simulation=simulateDecisionScenario({scenario:{...scenario,id:scenario.id||`comparison-${index+1}`,mode:scenario.mode||'meal'},totals,plannedTotals,targets,definitions,steps,coverage});
    const exceeded=simulation.nutrientImpacts.filter(row=>row.status==='exceeded').length;
    const protein=simulation.nutrientImpacts.find(row=>row.key==='protein')?.after||number(totals.protein)+number(plannedTotals.protein);
    const fiber=simulation.nutrientImpacts.find(row=>row.key==='fiber')?.after||number(totals.fiber)+number(plannedTotals.fiber);
    return {scenario:simulation.scenario,simulation,score:simulation.trace.score,ldl:simulation.after.ldl.score,exceeded,protein,fiber};
  }).sort((a,b)=>b.score-a.score||b.ldl-a.ldl||a.exceeded-b.exceeded||b.fiber-a.fiber||b.protein-a.protein||a.scenario.label.localeCompare(b.scenario.label));
  const winner=evaluated[0],runnerUp=evaluated[1];
  const margin=winner.score-runnerUp.score;
  const reasons=[];
  if(winner.ldl>runnerUp.ldl) reasons.push(`${winner.ldl-runnerUp.ldl} points better for LDL Support`);
  if(winner.exceeded<runnerUp.exceeded) reasons.push(`${runnerUp.exceeded-winner.exceeded} fewer configured limit${runnerUp.exceeded-winner.exceeded===1?'':'s'} exceeded`);
  if(winner.fiber>runnerUp.fiber) reasons.push(`${Math.round((winner.fiber-runnerUp.fiber)*10)/10} g more projected fiber`);
  if(winner.protein>runnerUp.protein) reasons.push(`${Math.round((winner.protein-runnerUp.protein)*10)/10} g more projected protein`);
  if(!reasons.length) reasons.push(margin?`${margin} point higher overall decision score`:'best combined fit after applying tie-break rules');
  const ranked=evaluated.map((entry,index)=>Object.freeze({...entry,rank:index+1}));
  const trace=createDecisionTrace({type:'meal_comparison',subject:winner.scenario.id,subjectId:winner.scenario.id,subjectName:winner.scenario.label,score:winner.score,confidence:Math.round(ranked.reduce((sum,x)=>sum+x.simulation.trace.confidence,0)/ranked.length),status:'preferred',rank:1,positive:reasons,negative:runnerUp?[`${runnerUp.scenario.label} trails by ${margin} point${margin===1?'':'s'}`]:[],missing:unique(ranked.flatMap(x=>x.simulation.trace.missing)),factors:[{label:'Overall score advantage',impact:margin,category:'comparison'},{label:'LDL Support advantage',impact:winner.ldl-runnerUp.ldl,category:'ldl'},{label:'Limit pressure advantage',impact:runnerUp.exceeded-winner.exceeded,category:'nutrition'}],methodology:'Each option is evaluated independently against the same current-day nutrition, activity, target, and confidence context. Options are ranked by overall decision score, then LDL Support, configured-limit pressure, fiber, protein, and name for a stable tie-break.',confidenceReason:'Comparison confidence is the average confidence of the independently evaluated options.',action:`Choose ${winner.scenario.label}. ${reasons[0]}.`,inputs:{option_count:ranked.length,option_ids:ranked.map(x=>x.scenario.id)},dataUsed:['Current nutrition totals','Planned meals','Configured targets','Current steps'],comparison:{summary:`${winner.scenario.label} ranks first among ${ranked.length} options. ${reasons.join('; ')}.`,winnerId:winner.scenario.id,runnerUpId:runnerUp?.scenario.id||null,scoreMargin:margin,ranking:ranked.map(x=>({id:x.scenario.id,label:x.scenario.label,rank:x.rank,score:x.score,ldl:x.ldl,limitsExceeded:x.exceeded}))},projectedResult:{winner:winner.scenario.label,score_margin:margin,ldl_advantage:winner.ldl-runnerUp.ldl,options_compared:ranked.length}});
  return Object.freeze({winner,ranked,trace});
}
