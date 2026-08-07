import fs from 'node:fs';
import assert from 'node:assert/strict';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[];
function test(name,fn){try{fn();checks.push([name,'PASS'])}catch(e){checks.push([name,`FAIL: ${e.message}`]);process.exitCode=1}}
test('Nutrition footer route renders a defined FoodHub inside an ErrorBoundary',()=>{assert.match(main,/function FoodHub\(\{navigate\}\)/);assert.match(main,/tab==='food'&&<ErrorBoundary label="Nutrition"><FoodHub navigate=\{visit\}\/><\/ErrorBoundary>/)});
test('Nutrition landing preserves current primary actions',()=>{const a=main.indexOf('function FoodHub');const b=main.indexOf('function FoodPlannerPage',a);const hub=main.slice(a,b);for(const value of ["title:'Menu'","title:'Log Once'","title:'Library'","title:'Restaurants'"])assert.ok(hub.includes(value),`${value} missing`);assert.doesNotMatch(hub,/title:'The Chef'/);assert.doesNotMatch(hub,/title:'Pantry'/);assert.doesNotMatch(hub,/title:'Shopping'/)});
test('Nutrition landing has required visible structure',()=>{const a=main.indexOf('function FoodHub');const b=main.indexOf('function FoodPlannerPage',a);const hub=main.slice(a,b);assert.match(hub,/<h2>Nutrition<\/h2>/);assert.match(hub,/<h1>Nutrition<\/h1>/);assert.match(hub,/nutrition-hub-card/)});
test('Hotfix version metadata is consistent',()=>{assert.equal(pkg.version,'1.4.17.7');assert.match(main,/const VERSION='1\.4\.17\.7'/);assert.match(main,/const BUILD_ID='141707'/);assert.match(main,/FH-20260807-141707/)});
for(const [name,result] of checks)console.log(`${result==='PASS'?'✓':'✗'} ${name}: ${result}`);
