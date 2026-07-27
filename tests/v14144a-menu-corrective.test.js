import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.14.4A metadata is centralized and current',()=>{
 assert.equal(meta.version,'1.4.14.4A');
 assert.match(main,/const VERSION='1\.4\.14\.4A'/);
 assert.equal(meta.schema_version,66);
});
test('Information view respects footer and handles user-facing values',()=>{
 assert.match(css,/\.menu-information-page\{[\s\S]*bottom|inset:[^;]*calc\(82px/);
 assert.match(css,/scroll-padding-bottom:110px/);
 assert.match(main,/typeof value==='boolean'/);
 assert.match(main,/nutritionKnown/);
});
test('Category editor is clamped between calendar and footer',()=>{
 assert.match(css,/\.restaurant-category-editor\{[\s\S]*top:calc\([\s\S]*--menu-calendar-height/);
 assert.match(css,/bottom:calc\(82px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/\.restaurant-category-editor \.editor-scroll\{[\s\S]*overflow-y:auto/);
});
test('Menu swipe exposes compact two-action left rail',()=>{
 assert.match(main,/const leftReveal=onEdit\?132:66/);
 assert.match(main,/setOffset\(-leftReveal\)/);
 assert.match(css,/width:66px!important/);
});
test('Light Menu has contrast, responsive width, rounded corners and reachable filters',()=>{
 assert.match(css,/width:calc\(100% - 24px\)/);
 assert.match(css,/border-radius:24px/);
 assert.match(css,/overflow-x:auto/);
 assert.match(css,/color:#182126!important/);
 assert.doesNotMatch(main,/<i aria-hidden="true">\{item\.icon\}<\/i>/);
});
