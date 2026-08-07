import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
test('active set entry is inline and expandable',()=>{
 assert.match(main,/function InlineExecutionSetCard/);
 assert.match(main,/inline-set-fields/);
 assert.match(main,/Complete set \$\{templateSet\.set_number\}/);
 assert.doesNotMatch(main,/if\(editing&&execution\)return <PerformedSetEditor/);
});
test('defaults are carried forward and focus selects the value for quick overwrite',()=>{
 assert.match(main,/prior\?\.reps/);
 assert.match(main,/exercise\.current_weight\?\?prior\?\.weight/);
 assert.match(main,/onFocus=\{e=>e\.currentTarget\.select\(\)\}/);
});
test('completed set presentation is reusable and read only',()=>{
 assert.match(main,/function ReadonlyCompletedSetCard/);
 assert.match(main,/performedSets\.length\?performedSets\.map/);
 assert.match(main,/status='completed'/);
});
test('existing rest timer and exercise completion flows remain attached to set completion',()=>{
 assert.match(main,/startWorkoutRestTimer\(execution\.execution_id,'set'/);
 assert.match(main,/startWorkoutRestTimer\(execution\.execution_id,'exercise'/);
 assert.match(main,/allComplete&&<Check\/>/);
 assert.match(css,/\.inline-set-shell/);
});
