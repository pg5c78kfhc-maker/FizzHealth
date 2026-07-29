import fs from 'node:fs';
import assert from 'node:assert/strict';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

const checks=[];
function test(name,fn){try{fn();checks.push([name,'PASS'])}catch(error){checks.push([name,`FAIL: ${error.message}`]);process.exitCode=1}}

test('Nutrition landing contains Menu and Log Once but no standalone Chef tile',()=>{
 const start=main.indexOf('function FoodHub');
 const end=main.indexOf('function FoodPlannerPage',start);
 const hub=main.slice(start,end);
 assert.match(hub,/title:'Menu'/);
 assert.match(hub,/title:'Log Once'/);
 assert.doesNotMatch(hub,/title:'The Chef'/);
 assert.doesNotMatch(hub,/id:'food-recommendations'/);
});

test('Standalone Chef route is removed from active navigation',()=>{
 const start=main.indexOf('const foodTabs=new Set');
 const end=main.indexOf('function FoodHub');
 const routing=main.slice(start,end);
 assert.doesNotMatch(routing,/food-recommendations/);
});

test("Menu recommendation section is renamed Today's Recommendations",()=>{
 assert.match(main,/<h3>Today's Recommendations<\/h3>/);
 assert.match(main,/toggleSection\("Today's Recommendations"\)/);
 assert.match(main,/sectionTitle="Today's Recommendations"/);
});

test('Eating actions rebalance into two equal columns',()=>{
 assert.match(css,/\.nutrition-hub-card\.eating \.nutrition-action-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
});

test('Release metadata is current',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.49'/);
 assert.match(main,/const BUILD_ID='141549'/);
 assert.match(main,/FH-20260729-141549/);
});

for(const [name,result] of checks) console.log(`${result.startsWith('PASS')?'✓':'✗'} ${name}: ${result}`);
