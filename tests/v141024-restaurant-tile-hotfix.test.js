import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('restaurant subsystem defines safe current-day totals before ranking',()=>{
 assert.match(main,/function getTodayTotals\(date=today\(\)\)/);
 assert.match(main,/COALESCE\(SUM\(saturated_fat\),0\) saturated_fat/);
 assert.match(main,/const totals=getTodayTotals\(\)/);
});
test('restaurant tile still routes to the restaurant subsystem',()=>{
 assert.match(main,/navigate\('restaurants'\)/);
 assert.match(main,/tab==='restaurants'/);
});
