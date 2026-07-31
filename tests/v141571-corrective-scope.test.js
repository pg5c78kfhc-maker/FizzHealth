import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('prepared inventory takes precedence over ingredient shortages',()=>{
 assert.match(main,/const availability=preparedTotal>0\?/);
 assert.match(main,/prepared serving.*available now/);
});
test('recipe component picker supports gram units',()=>{
 assert.match(main,/recipeServingGrams\?\['g','serving'\]/);
 assert.doesNotMatch(main,/Unit<input value="serving" readOnly/);
});
test('obsolete meal promotion is replaced by existing enrichment workspace',()=>{
 assert.match(main,/>Enrich with AI</);
 assert.match(main,/<FoodEnrichmentWorkspace/);
 assert.doesNotMatch(main,/compact-action-row[^;]*Promote to Meal/);
});
test('packaged inventory editor asks only the essential questions',()=>{
 assert.match(main,/Serving size/);
 assert.match(main,/How many \$\{packagePlural\} do you have\?/);
 assert.match(main,/Is one \$\{packageSingular\} open\?/);
 assert.match(main,/Servings left in the open package/);
});
test('editor shell is keyboard safe and scrollable',()=>{
 assert.match(css,/v1\.4\.15\.71 corrective/);
 assert.match(css,/grid-template-rows:auto minmax\(0,1fr\) auto/);
 assert.match(css,/overflow-y:auto!important/);
});
