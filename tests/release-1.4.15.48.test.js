import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release metadata identifies v1.4.15.48',()=>{
 assert.equal(version.version,'1.4.15.48');
 assert.equal(version.build_id,'141548');
 assert.equal(version.release_id,'FH-20260729-141548');
 assert.match(main,/const VERSION='1\.4\.15\.48'/);
});

test('Nutrition display uses complete shared record sections instead of legacy cards',()=>{
 assert.match(main,/NUTRITION_RECORD_SECTIONS/);
 assert.match(main,/<h3>Nutrition<\/h3><small>Tap pencil to edit<\/small>/);
 assert.match(main,/nutritionFieldsForSection\(section\).*nutritionDisplayText/);
 assert.match(main,/<h4>Serving Basis<\/h4>/);
 assert.doesNotMatch(main,/!isRecipe&&<section className="food-detail-summary"/);
});

test('Nutrition view and edit share section definitions and order',()=>{
 const uses=[...main.matchAll(/NUTRITION_RECORD_SECTIONS\.map/g)];
 assert.ok(uses.length>=2,'shared sections must drive both display and edit');
 for(const label of ['Macronutrients','Vitamins & Minerals','Other Nutrition'])assert.match(main,new RegExp(label.replace('&','&')));
});

test('serving amount and unit are combined',()=>{
 assert.match(main,/servingBasisText\(source\)/);
 assert.match(main,/className="serving-size-control"/);
 assert.doesNotMatch(main,/<span>Unit<\/span><b>/);
});

test('nutrient units remain attached to edit values',()=>{
 assert.match(main,/className="nutrition-value-input"/);
 assert.match(main,/<em>\{n\.unit\}<\/em>/);
 assert.match(css,/\.nutrition-value-input\{display:grid/);
});
