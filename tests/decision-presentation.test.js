import test from 'node:test';
import assert from 'node:assert/strict';
import {buildConfidenceExplanation,buildDecisionAudit,buildDecisionExplanation,buildProjectionRows,buildRankingExplanation,canonicalDecisionTerm,describeFactor,groupDecisionFactors,serializeDecisionTrace} from '../src/decision/presentation.js';
import {createDecisionTrace} from '../src/decision/engine.js';

function sample(overrides={}){
 return createDecisionTrace({type:'chef_recommendation',subject:'p1',subjectName:'Salmon bowl',score:72,confidence:88,status:'good',factors:[
  {label:'Protein fit',impact:18,category:'nutrition'},{label:'Fiber fit',impact:7,category:'nutrition'},{label:'Saturated fat pressure',impact:-8,category:'ldl'}
 ],dataUsed:['Pantry','Targets'],missing:['Expiration date'],action:'Add a higher-fiber side',confidenceReason:'Most nutrition values are verified.',projectedResult:{calories_remaining:500,protein_remaining:40},...overrides});
}

test('decision audit groups factors and reconciles the recorded score',()=>{
 const audit=buildDecisionAudit(sample());
 assert.equal(audit.factorImpact,17);assert.equal(audit.inferredBaseline,55);assert.equal(audit.groups[0].category,'nutrition');assert.equal(audit.groups[0].netImpact,25);assert.equal(audit.missingCount,1);assert.equal(audit.dataSourceCount,2);
});

test('factor grouping orders categories by absolute contribution and labels direction',()=>{
 const groups=groupDecisionFactors([{label:'A',impact:2,category:'time'},{label:'B',impact:-15,category:'ldl'},{label:'C',impact:0,category:'time'}]);
 assert.deepEqual(groups.map(group=>group.category),['ldl','time']);assert.equal(groups[0].factors[0].direction,'harmful');assert.equal(groups[1].factors[1].direction,'neutral');
});

test('shared terminology normalizes the same factor consistently',()=>{
 assert.equal(canonicalDecisionTerm('Saturated fat pressure'),'saturated fat');
 assert.equal(canonicalDecisionTerm('sat-fat'),'saturated fat');
 assert.equal(canonicalDecisionTerm('Fiber fit'),'fiber');
});

test('shared factor descriptions use one direction vocabulary',()=>{
 assert.equal(describeFactor({label:'Protein fit',impact:8}).text,'protein helped the result by 8 points.');
 assert.equal(describeFactor({label:'Saturated fat pressure',impact:-1}).text,'saturated fat reduced the result by 1 point.');
 assert.equal(describeFactor({label:'Fiber fit',impact:0}).direction,'neutral');
});

test('plain-language explanation identifies primary drivers and confidence gaps',()=>{
 const explanation=buildDecisionExplanation(sample());
 assert.match(explanation.summary,/score of 72/);assert.equal(explanation.strongestPositive.term,'protein');assert.equal(explanation.strongestPositive.impact,18);assert.equal(explanation.strongestNegative.term,'saturated fat');assert.equal(explanation.strongestNegative.impact,-8);assert.match(explanation.improvement,/higher-fiber side/);assert.match(explanation.completeness,/Expiration date/);
});

test('confidence wording is shared across decision types',()=>{
 const explanation=buildConfidenceExplanation(sample());
 assert.equal(explanation.level,'High');assert.equal(explanation.reason,'Most nutrition values are verified.');assert.match(explanation.completeness,/1 missing input/);
});

test('projection rows turn before-after pairs into readable changes',()=>{
 const rows=buildProjectionRows({ldl_before:64,ldl_after:70,steps_remaining:2500});
 assert.deepEqual(rows[0],{key:'ldl',label:'Ldl',before:'64',after:'70',kind:'change'});assert.equal(rows[1].value,'2,500 steps');
});

test('ranking explanation is consistent with and without an explicit comparison',()=>{
 assert.equal(buildRankingExplanation(sample({comparison:{summary:'Highest-ranked option among evaluated candidates'}})),'Highest-ranked option among evaluated candidates.');
 assert.equal(buildRankingExplanation(sample({comparison:null,rank:1})),'This was the highest-scoring option among the evaluated choices.');
 assert.match(buildRankingExplanation(sample({comparison:null,rank:3})),/ranked #3/);
});

test('raw trace serializer produces readable JSON',()=>{assert.match(serializeDecisionTrace({type:'test',score:50}),/\n  "score": 50/);});
