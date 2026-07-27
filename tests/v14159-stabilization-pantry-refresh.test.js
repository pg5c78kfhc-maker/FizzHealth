import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Menu information pencil opens canonical Food editor exclusively',()=>{
 assert.match(main,/const canonical=optionalQuery\('SELECT \* FROM foods WHERE food_id=\? LIMIT 1'/);
 assert.match(main,/setInformationItem\(null\);setCategoryEditor\(null\);setFoodEditor\(canonical\)/);
 assert.match(main,/foodEditor\?<NutritionEditor/);
});

test('Food editor updates one existing record and exposes Ingredient Only and Category',()=>{
 assert.match(main,/UPDATE foods SET \$\{assignments\.join\(','\)\} WHERE food_id=\?/);
 assert.match(main,/>Ingredient only</);
 assert.match(main,/>Category<select/);
 assert.doesNotMatch(main,/INSERT INTO foods[\s\S]{0,200}ingredient_only/);
});

test('Chef section has zero stack gap and full-width media',()=>{
 assert.match(css,/planned-meals-menu \+ \.today-menu\{[\s\S]*margin-top:-18px!important/);
 assert.match(css,/chef-section \.white-menu-list\{[\s\S]*width:100%!important;[\s\S]*margin:0!important/);
 assert.match(css,/chef-pick-image\{[\s\S]*width:calc\(100% \+ 28px\)!important/);
});

test('Pantry refresh derives membership without adding a database flag',()=>{
 assert.match(main,/function pantryInventoryRows\(rows=\[\]\)/);
 assert.match(main,/isEmbeddedRecipeComponent/);
 assert.match(main,/const allRows=pantryInventoryRows\(query/);
 assert.doesNotMatch(main,/ALTER TABLE pantry ADD COLUMN independently_stocked/i);
});
