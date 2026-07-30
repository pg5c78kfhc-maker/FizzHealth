import fs from 'node:fs';
import assert from 'node:assert/strict';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const checks=[];
function test(name,fn){try{fn();checks.push([name,'PASS'])}catch(error){checks.push([name,`FAIL: ${error.message}`]);process.exitCode=1}}

test('Nutrition landing exposes only Menu and Log Once in Eating',()=>{
 const hub=main.slice(main.indexOf('function FoodHub'),main.indexOf('function FoodPlannerPage'));
 assert.match(hub,/title:'Menu'/);
 assert.match(hub,/title:'Log Once'/);
 assert.doesNotMatch(hub,/The Chef|food-recommendations/);
});

test('No standalone Chef page or active route remains',()=>{
 assert.doesNotMatch(main,/function FoodRecommendationsPage/);
 assert.doesNotMatch(main,/function ChefRecommendations/);
 assert.doesNotMatch(main,/title="The Chef"/);
 assert.doesNotMatch(main,/food-recommendations/);
});

test("Today's Recommendations remains inside Menu",()=>{
 assert.match(main,/<h3>Today's Recommendations<\/h3>/);
 assert.match(main,/sectionTitle="Today's Recommendations"/);
 assert.match(main,/evaluateDecision\('chef_rank'/);
});

test('Eating layout remains two equal actions',()=>{
 assert.match(css,/\.nutrition-hub-card\.eating \.nutrition-action-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
});

test('Release metadata is current',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.50'/);
 assert.match(main,/const BUILD_ID='141550'/);
 assert.match(main,/FH-20260729-141550/);
});

for(const [name,result] of checks) console.log(`${result.startsWith('PASS')?'✓':'✗'} ${name}: ${result}`);
