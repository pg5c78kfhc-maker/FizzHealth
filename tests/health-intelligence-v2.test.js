import test from 'node:test';import assert from 'node:assert/strict';
import {linearTrend,discoverCorrelations,interventionImpact,goalIntelligence,preventiveStatus,buildHealthIntelligence2} from '../src/health/longitudinal.js';
test('linear longitudinal trend',()=>{const r=linearTrend([{date:'2026-01-01',value:10},{date:'2026-01-11',value:8}]);assert.equal(r.direction,'down');assert.equal(r.points,2)});
test('filters weak correlations',()=>{const a=[1,2,3,4,5].map((v,i)=>({date:`2026-01-0${i+1}`,value:v}));const b=a.map(x=>({...x,value:x.value*2}));assert.equal(discoverCorrelations({fiber:a,ldl:b}).length,1)});
test('measures intervention impact',()=>{const x=interventionImpact({name:'walking',before:[{value:130},{value:128}],after:[{value:122},{value:120}],outcome:'systolic BP'});assert.equal(x.status,'measured');assert.ok(x.change<0)});
test('goal intelligence forecasts correct direction',()=>{const g=goalIntelligence({current:225,target:215,direction:'down',history:[{date:'2026-01-01',value:230},{date:'2026-01-11',value:225}]});assert.equal(g.status,'on_track');assert.ok(g.daysToTarget>0)});
test('preventive planner identifies overdue',()=>{assert.equal(preventiveStatus([{due_date:'2020-01-01'}],new Date('2026-01-01'))[0].status,'overdue')});
test('builds explainable health intelligence',()=>{const x=buildHealthIntelligence2({metrics:[{metric_type:'weight',measured_at:'2026-01-01',value_primary:230},{metric_type:'weight',measured_at:'2026-01-11',value_primary:225}]});assert.ok(x.coach.length);assert.equal(x.overview.trends.weight.direction,'down')});
