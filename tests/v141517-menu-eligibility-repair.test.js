import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');

test('migration repairs active Food and Recipe classification from Ingredient only',()=>{
 assert.match(db,/version:72,name:'menu_eligibility_classification_repair'/);
 assert.match(db,/UPDATE foods[\s\S]*ingredient_only[\s\S]*usage_designation[\s\S]*consumption_role/);
 assert.match(db,/UPDATE recipes[\s\S]*ingredient_only[\s\S]*usage_designation/);
 assert.match(db,/WHERE COALESCE\(archived,0\)=0/);
});

test('Menu eligibility uses canonical Ingredient only value',()=>{
 assert.match(main,/FROM foods WHERE COALESCE\(archived,0\)=0 AND COALESCE\(ingredient_only,0\)=0 ORDER BY name/);
 assert.match(main,/FROM recipes WHERE COALESCE\(archived,0\)=0 AND COALESCE\(ingredient_only,0\)=0 GROUP BY recipe_id,recipe_name/);
});

test('Food and Recipe classification saves synchronize legacy fields',()=>{
 assert.match(main,/UPDATE foods SET category=\?,ingredient_only=0,classification='food',usage_designation='both',consumption_role='both'/);
 assert.match(main,/UPDATE recipes SET category=\?,ingredient_only=0,classification='recipe',usage_designation='both'/);
 assert.match(main,/ingredientOnly\?'component':'both'/);
});
