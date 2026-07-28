import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');

test('planner update writes only nutrient columns present in planned_meals',()=>{
 assert.match(source,/PRAGMA table_info\(planned_meals\)/);
 assert.match(source,/persistedNutrients=NUTRIENT_KEYS\.filter\(key=>plannedColumns\.has\(key\)\)/);
 assert.doesNotMatch(source,/nutrientAssignments=NUTRIENT_KEYS\.map\(key=>`\$\{key\}=\?`\)/);
});

test('portion remains unconstrained above one and supports fractions',()=>{
 assert.match(source,/Number\.isFinite\(portions\)\|\|portions<=0/);
 assert.match(source,/\['1\.5','1½'\]/);
 assert.match(source,/\['2','2'\]/);
});

test('planned-to-consumed synchronization preserves amount',()=>{
 assert.match(source,/amount:row\.amount,unit:row\.unit/);
 assert.match(source,/pantryDelta=same\?\(Number\(row\.amount\)\|\|0\)/);
});

test('save failures are visible and duplicate submissions are blocked',()=>{
 assert.match(source,/if\(!picker\|\|picker\.saving\)return/);
 assert.match(source,/saving:false,error:error\?\.message/);
 assert.match(source,/disabled=\{Boolean\(picker\.saving\)\}/);
});
