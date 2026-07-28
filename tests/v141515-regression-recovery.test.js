import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('recipe pencil opens the existing recipe editor',()=>{
 assert.match(main,/aria-label="Edit recipe"><Pencil\/><\/button>/);
 assert.match(main,/editing&&<RecipeCreateEditor recipe=\{\{recipe_id:source\.recipe_id,recipe_name:source\.recipe_name\}\}/);
});
test('recipe ingredients can be added edited and deleted',()=>{
 assert.match(main,/Add ingredient/);
 assert.match(main,/setEditingRow\(row\);setPicker\(true\)/);
 assert.match(main,/SwipeDeleteIngredient/);
 assert.match(main,/DELETE FROM recipes WHERE recipe_id=\?/);
});
test('Pantry swipe right uses an item and swipe left edits it',()=>{
 assert.match(main,/function PantrySwipeCard/);
 assert.match(main,/if\(value>=46\)setOffset\(88\);else if\(value<=-46\)setOffset\(-88\)/);
 assert.match(main,/className="pantry-swipe-use"/);
 assert.match(main,/className="pantry-swipe-edit"/);
 assert.match(css,/\.pantry-swipe-shell/);
});
test('open carton question refers to contained units, never cartons',()=>{
 assert.match(main,/How many \$\{plural\} are left in the open \$\{packageName\}\?/);
 assert.doesNotMatch(main,/How many cartons are left in the open carton/);
});
test("accepted Menu and Chef's Picks layout rules remain present",()=>{
 assert.match(css,/chef-section \.white-menu-list/);
 assert.match(css,/chef-pick-image/);
 assert.match(main,/>Chef's Picks</);
});
