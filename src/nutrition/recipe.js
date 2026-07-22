import {NUTRIENT_KEYS} from './registry.js';
import {scaleForServing} from './units.js';

const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const normalizedName=value=>String(value??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

export function resolveRecipeFood(recipeRow,foods){
  const ingredientId=String(recipeRow.ingredient_id??'').trim().toUpperCase();
  if(ingredientId){
    const idMatches=foods.filter(food=>String(food.food_id??'').trim().toUpperCase()===ingredientId);
    if(idMatches.length===1)return {food:idMatches[0],method:'id'};
    if(idMatches.length>1)return {food:null,reason:`Multiple foods use ingredient ID ${recipeRow.ingredient_id}.`};
  }
  const name=normalizedName(recipeRow.ingredient_name);
  if(!name)return {food:null,reason:'Ingredient has no food ID or name.'};
  const nameMatches=foods.filter(food=>normalizedName(food.name)===name);
  if(nameMatches.length===1)return {food:nameMatches[0],method:'name'};
  if(nameMatches.length>1)return {food:null,reason:`Multiple foods match ${recipeRow.ingredient_name}. Add a Food ID to the recipe ingredient.`};
  return {food:null,reason:`No food matches ${recipeRow.ingredient_name}.`};
}

export function buildRecipeSnapshot(recipeRows,foods){
  if(!recipeRows.length)return null;
  const total=Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,0]));
  const ingredients=[];
  const issues=[];
  for(const row of recipeRows){
    const resolved=resolveRecipeFood(row,foods);
    if(!resolved.food){issues.push(resolved.reason);ingredients.push({ingredient_id:row.ingredient_id||null,ingredient_name:row.ingredient_name,amount:Number(row.amount)||0,unit:row.unit||'',resolved:false,issue:resolved.reason});continue;}
    const food=resolved.food;
    const scaling=scaleForServing({amount:row.amount,amountUnit:row.unit||food.unit,servingAmount:food.default_serving,servingUnit:food.unit||row.unit});
    if(!scaling.ok){issues.push(`${row.ingredient_name}: ${scaling.reason}`);ingredients.push({ingredient_id:row.ingredient_id||food.food_id,ingredient_name:row.ingredient_name,food_id:food.food_id,amount:Number(row.amount)||0,unit:row.unit||food.unit||'',resolved:false,issue:scaling.reason});continue;}
    for(const key of NUTRIENT_KEYS)total[key]+=finite(food[key])*scaling.ratio;
    const contribution=Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,finite(food[key])*scaling.ratio]));
    ingredients.push({ingredient_id:row.ingredient_id||food.food_id,ingredient_name:row.ingredient_name,food_id:food.food_id,food_name:food.name,amount:Number(row.amount)||0,unit:row.unit||food.unit||'',resolved_amount:Number(row.amount)||0,resolved_unit:row.unit||food.unit||'',default_serving:Number(food.default_serving)||1,food_unit:food.unit||row.unit||'',serving_amount:Number(food.default_serving)||1,serving_unit:food.unit||row.unit||'',ratio:scaling.ratio,resolved:true,...contribution,nutrition:contribution});
  }
  return {type:'recipe',recipe_id:recipeRows[0].recipe_id||recipeRows[0].recipe_name,recipe_name:recipeRows[0].recipe_name,ingredients,nutrition:total,nutrition_known:issues.length===0&&ingredients.length>0?1:0,issues,serving:1,unit:'recipe'};
}

export function compactRecipeMealNotes(snapshot){
  return JSON.stringify({recipe_id:snapshot.recipe_id,ingredients:snapshot.ingredients.map(item=>({ingredient_id:item.ingredient_id||null,food_id:item.food_id||null,name:item.ingredient_name,amount:item.amount,unit:item.unit,nutrition:item.nutrition||null})),nutrition_snapshot:snapshot.nutrition,issues:snapshot.issues||[]});
}
