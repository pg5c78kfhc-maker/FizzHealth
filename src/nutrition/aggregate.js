import {NUTRIENT_KEYS} from './registry.js';
import {scaleForServing} from './units.js';
import {buildRecipeSnapshot} from './recipe.js';

const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const normalized=value=>String(value??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

export function getRecipeNutrition(runQuery,recipeId){
  const rows=runQuery(`SELECT * FROM recipes WHERE recipe_id=? OR recipe_name=(SELECT recipe_name FROM recipes WHERE recipe_id=? LIMIT 1) ORDER BY id`,[recipeId,recipeId]);
  if(!rows.length)return null;
  const foods=runQuery('SELECT * FROM foods WHERE COALESCE(archived,0)=0 ORDER BY food_id');
  return buildRecipeSnapshot(rows,foods);
}

function resolveFood(component,foods){
  const id=String(component.component_id??'').trim().toUpperCase();
  if(id){
    const matches=foods.filter(food=>String(food.food_id??'').trim().toUpperCase()===id);
    if(matches.length===1)return {food:matches[0]};
    if(matches.length>1)return {reason:`Multiple foods use component ID ${component.component_id}.`};
  }
  const name=normalized(component.component_name);
  const matches=foods.filter(food=>normalized(food.name)===name);
  if(matches.length===1)return {food:matches[0]};
  if(matches.length>1)return {reason:`Multiple foods match ${component.component_name}.`};
  return {reason:`No food matches ${component.component_name}.`};
}

export function getMealNutrition(runQuery,mealId){
  const meal=runQuery('SELECT * FROM meal_definitions WHERE meal_id=? LIMIT 1',[mealId])[0];
  if(!meal)return null;
  const components=runQuery('SELECT * FROM meal_components WHERE meal_id=? ORDER BY sort_order,id',[mealId]);
  const foods=runQuery('SELECT * FROM foods WHERE COALESCE(archived,0)=0 ORDER BY food_id');
  const total=Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,0]));
  const resolvedComponents=[];
  const issues=[];

  for(const component of components){
    const amount=Number(component.amount);
    if(!Number.isFinite(amount)||amount<=0){
      const issue=`${component.component_name}: quantity must be greater than zero.`;
      issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;
    }
    let nutrition=null;
    if(component.component_type==='recipe'){
      const snapshot=getRecipeNutrition(runQuery,component.component_id);
      if(!snapshot){const issue=`${component.component_name}: recipe not found.`;issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;}
      if(Number(snapshot.nutrition_known)!==1){
        const issue=`${component.component_name}: ${snapshot.issues.join(' ')||'recipe nutrition is incomplete.'}`;
        issues.push(issue);resolvedComponents.push({...component,resolved:false,issue,nested:snapshot});continue;
      }
      nutrition=Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,finite(snapshot.nutrition[key])*amount]));
    }else if(component.component_type==='food'){
      const resolved=resolveFood(component,foods);
      if(!resolved.food){issues.push(resolved.reason);resolvedComponents.push({...component,resolved:false,issue:resolved.reason});continue;}
      const food=resolved.food;
      if(Number(food.nutrition_known)!==1){const issue=`${component.component_name}: food nutrition is unknown.`;issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;}
      const scaling=scaleForServing({amount,amountUnit:component.unit||food.unit,servingAmount:food.default_serving,servingUnit:food.unit||component.unit});
      if(!scaling.ok){const issue=`${component.component_name}: ${scaling.reason}`;issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;}
      nutrition=Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,finite(food[key])*scaling.ratio]));
    }else{
      const issue=`${component.component_name}: unsupported component type ${component.component_type||'missing'}.`;
      issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;
    }
    for(const key of NUTRIENT_KEYS)total[key]+=finite(nutrition[key]);
    resolvedComponents.push({...component,resolved:true,nutrition,...nutrition});
  }

  return {type:'meal',meal_id:meal.meal_id,title:meal.title,components:resolvedComponents,nutrition:total,nutrition_known:issues.length===0&&components.length>0?1:0,issues,serving:1,unit:'meal'};
}

export function auditAggregateNutrition(runQuery){
  const recipes=runQuery(`SELECT recipe_id,MAX(recipe_name) recipe_name FROM recipes WHERE COALESCE(archived,0)=0 GROUP BY recipe_id ORDER BY recipe_name COLLATE NOCASE`).map(row=>{
    const snapshot=getRecipeNutrition(runQuery,row.recipe_id);
    return {type:'recipe',id:row.recipe_id,name:row.recipe_name,status:Number(snapshot?.nutrition_known)===1?'valid':'invalid',issues:snapshot?.issues||['Recipe could not be calculated.'],nutrition:snapshot?.nutrition||null};
  });
  const meals=runQuery(`SELECT meal_id,title FROM meal_definitions WHERE COALESCE(archived,0)=0 ORDER BY title COLLATE NOCASE`).map(row=>{
    const snapshot=getMealNutrition(runQuery,row.meal_id);
    return {type:'meal',id:row.meal_id,name:row.title,status:Number(snapshot?.nutrition_known)===1?'valid':'invalid',issues:snapshot?.issues||['Meal could not be calculated.'],nutrition:snapshot?.nutrition||null};
  });
  const all=[...recipes,...meals];
  return {recipes,meals,valid:all.filter(x=>x.status==='valid').length,invalid:all.filter(x=>x.status!=='valid').length,total:all.length};
}
