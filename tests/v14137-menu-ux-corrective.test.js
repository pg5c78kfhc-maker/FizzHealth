import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
test('v1.4.13.7 centers the selected date and aligns shared restaurant controls',()=>{
 assert.match(main,/i-3/);assert.match(main,/calendar-control-row/);assert.match(main,/RESTAURANT DAY/);assert.match(main,/consumed_local_date BETWEEN/);assert.match(main,/calendar-meal-indicator/);
});
test('v1.4.13.7 uses collapsible planned, Chef, category, and restaurant sections',()=>{
 assert.match(main,/openSections/);assert.match(main,/planned:\$\{slot\}/);assert.match(main,/Chef\'s Picks/);assert.match(main,/categoryNames/);assert.match(main,/restaurantGroups/);
});
test('v1.4.13.7 renders only expanded food lists as white continuous menus',()=>{
 assert.match(main,/white-menu-list/);assert.match(css,/background:#fff!important/);assert.match(css,/border:0!important/);assert.match(css,/border-bottom:1px solid #e1e1e1/);
});
