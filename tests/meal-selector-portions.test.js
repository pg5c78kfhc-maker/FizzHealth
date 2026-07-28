import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('src/main.jsx','utf8');
const styles=fs.readFileSync('src/styles.css','utf8');
test('Add to Meals exposes decimal and quick portion controls',()=>{
 assert.match(source,/meal-portion-controls/);
 for(const token of ["['0.25','¼']","['0.5','½']","['0.75','¾']","['1.5','1½']","['2','2']"])assert.ok(source.includes(token),token);
 assert.match(source,/inputMode="decimal"/);
});
test('planned entries store and update selected portions with scaled nutrition',()=>{
 assert.match(source,/amount:portions,unit:'serving',\.\.\.scaledNutrition/);
 assert.match(source,/UPDATE planned_meals SET amount=\?,unit='serving',\$\{nutrientAssignments\}/);
 assert.match(source,/finite\(meal\[key\]\)\*portions/);
});
test('meal destination remains multi-select and compact',()=>{
 assert.match(source,/picker\.selected\.includes\(slot\)/);
 assert.match(styles,/\.add-to-meals-backdrop \.multi-select-meals button\{min-height:48px/);
});
