import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getRecipeNutrition,getMealNutrition,auditAggregateNutrition} from '../src/nutrition/aggregate.js';

const foods=[
 {food_id:'F1',name:'Chicken',default_serving:100,unit:'g',calories:165,protein:31,carbs:0,fiber:0,fat:3.6,saturated_fat:1,sodium:74,cholesterol:85,nutrition_known:1,archived:0},
 {food_id:'F2',name:'Greens',default_serving:100,unit:'g',calories:25,protein:2,carbs:4,fiber:3,fat:0.3,saturated_fat:0,sodium:30,cholesterol:0,nutrition_known:1,archived:0}
];
const recipes=[
 {id:1,recipe_id:'R1',recipe_name:'Chicken Salad',ingredient_id:'F1',ingredient_name:'Chicken',amount:200,unit:'g',archived:0},
 {id:2,recipe_id:'R1',recipe_name:'Chicken Salad',ingredient_id:'F2',ingredient_name:'Greens',amount:100,unit:'g',archived:0}
];
const mealDefinitions=[{meal_id:'M1',title:'Lunch',archived:0}];
const mealComponents=[{id:1,meal_id:'M1',component_type:'recipe',component_id:'R1',component_name:'Chicken Salad',amount:1,unit:'serving',sort_order:0}];
function runQuery(sql,params=[]){
 if(sql.includes('FROM foods'))return foods;
 if(sql.includes('FROM recipes WHERE recipe_id='))return recipes.filter(r=>r.recipe_id===params[0]);
 if(sql.includes('FROM recipes WHERE COALESCE'))return [{recipe_id:'R1',recipe_name:'Chicken Salad'}];
 if(sql.includes('FROM meal_definitions WHERE meal_id='))return mealDefinitions.filter(m=>m.meal_id===params[0]);
 if(sql.includes('FROM meal_definitions WHERE COALESCE'))return mealDefinitions;
 if(sql.includes('FROM meal_components'))return mealComponents.filter(c=>c.meal_id===params[0]);
 return [];
}

test('canonical recipe calculation uses current food nutrition',()=>{
 const first=getRecipeNutrition(runQuery,'R1');
 assert.equal(Math.round(first.nutrition.calories),355);
 foods[0].calories=200;
 const current=getRecipeNutrition(runQuery,'R1');
 assert.equal(Math.round(current.nutrition.calories),425);
 foods[0].calories=165;
});

test('meal calculation nests canonical recipe calculation',()=>{
 const snapshot=getMealNutrition(runQuery,'M1');
 assert.equal(snapshot.nutrition_known,1);
 assert.equal(Math.round(snapshot.nutrition.calories),355);
 assert.equal(Math.round(snapshot.nutrition.protein),64);
});

test('unknown source nutrition never becomes a known zero',()=>{
 foods[1].nutrition_known=0;
 const recipe=getRecipeNutrition(runQuery,'R1');
 const meal=getMealNutrition(runQuery,'M1');
 assert.equal(recipe.nutrition_known,0);
 assert.equal(meal.nutrition_known,0);
 assert.match(recipe.issues.join(' '),/unknown/i);
 foods[1].nutrition_known=1;
});

test('database-wide aggregate audit covers recipes and meals',()=>{
 const report=auditAggregateNutrition(runQuery);
 assert.equal(report.total,2);
 assert.equal(report.valid,2);
 assert.equal(report.invalid,0);
});

test('UI consumers cannot call low-level recipe builder directly',()=>{
 const source=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/buildRecipeSnapshot\s*\(/);
 assert.match(source,/getMealNutrition\(query,row\.meal_id\)/);
 assert.match(source,/Number\(item\.nutrition_known\)===1/);
});
