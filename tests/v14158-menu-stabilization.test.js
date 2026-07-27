import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Menu Food pencil opens canonical NutritionEditor and closes information first',()=>{
 assert.match(main,/if\(source==='food'\)\{setFoodEditor\(meal\);return\}/);
 assert.match(main,/\{foodEditor&&<NutritionEditor food=\{foodEditor\}/);
 assert.match(main,/setInformationItem\(null\)/);
});

test('Food save updates the existing food record and restores non-ingredient classification',()=>{
 assert.match(main,/UPDATE foods SET \$\{assignments\.join\(','\)\} WHERE food_id=\?/);
 assert.match(main,/ingredientOnly\?'ingredient':'food'/);
});

test('Menu editor preserves section state and restores scroll after save or cancel',()=>{
 assert.match(main,/openSections,setOpenSections/);
 assert.match(main,/menuReturnScrollRef=useRef\(0\)/);
 assert.match(main,/rememberMenuPosition/);
 assert.match(main,/window\.scrollTo\(\{top:menuReturnScrollRef\.current,left:0,behavior:'auto'\}\)/);
});

test("Chef's Picks and categories share exact width with no stack gap",()=>{
 assert.match(css,/today-menu\{[\s\S]*flex-direction:column!important;[\s\S]*gap:0!important/);
 assert.match(css,/today-menu>\.menu-category\{[\s\S]*width:100%!important/);
 assert.match(css,/chef-section\+\.menu-category\{[\s\S]*margin-top:0!important/);
 assert.match(css,/chef-pick-image\{[\s\S]*width:100%!important/);
});

test('release identity is centralized for v1.4.15.8',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.8'/);
 assert.match(main,/const BUILD_ID='141508'/);
 assert.match(main,/const DEPLOYMENT_ID='FH-20260727-141508'/);
});
