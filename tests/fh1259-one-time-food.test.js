import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const styles=fs.readFileSync('src/styles.css','utf8');

test('FH-1259 exposes user-facing Log Once capture with explicit knowledge-base boundary',()=>{
 assert.match(main,/>Log Once</);
 assert.match(main,/Record a food or meal without saving it to Foods, Recipes, or Pantry/);
 assert.match(main,/This will not create a Food Database item, Recipe, or Pantry record/);
 assert.match(main,/Close Log Once editor/);
 assert.match(main,/className="panel meal-entry fixed-editor log-once-editor"/);
 assert.match(styles,/FH-1259 — One-Time Food Logging/);
});

test('FH-1259 writes a classified meal event without creating reusable or pantry entities',()=>{
 assert.match(main,/sourceRecordId=`one-time-/);
 assert.match(main,/null,name,qty,unit/);
 assert.match(main,/'one_time',sourceRecordId/);
 const saveStart=main.indexOf('async function saveLogOnce');
 const saveEnd=main.indexOf('const n=calculated()',saveStart);
 const saveBody=main.slice(saveStart,saveEnd);
 assert.match(saveBody,/INSERT INTO meals/);
 assert.doesNotMatch(saveBody,/INSERT INTO foods/);
 assert.doesNotMatch(saveBody,/INSERT INTO recipes/);
 assert.doesNotMatch(saveBody,/INSERT INTO pantry/);
 assert.doesNotMatch(saveBody,/UPDATE pantry/);
});

test('FH-1259 distinguishes unknown nutrition from verified zero and refreshes derived views',()=>{
 assert.match(main,/raw===''\?null:Number\(raw\)/);
 assert.match(main,/known=Object\.values\(nutrition\)\.some\(value=>value!=null\)/);
 assert.match(main,/nutrition_known,source,source_record_id/);
 assert.match(main,/localStorage\.setItem\('fizz-meal-added','1'\)/);
 assert.match(main,/refresh\(\);setLocalTick/);
});
