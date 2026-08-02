import {NUTRIENT_KEYS} from './registry.js';
import {scaleFoodQuantity} from './units.js';
import {buildRecipeSnapshot} from './recipe.js';

const finite=value=>Number.isFinite(Number(value))?Number(value):0;
const normalized=value=>String(value??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const validTotals=nutrition=>nutrition&&NUTRIENT_KEYS.every(key=>Number.isFinite(Number(nutrition[key]))&&Number(nutrition[key])>=0);

function classifyIssues(issues=[]){
 const text=issues.join(' ').toLowerCase();
 if(!issues.length)return 'valid';
 if(/quantity|greater than zero/.test(text))return 'invalid_quantity';
 if(/multiple/.test(text))return 'ambiguous_reference';
 if(/no food|not found|missing|unsupported component/.test(text))return 'broken_reference';
 if(/unit|convert|serving/.test(text))return 'unsupported_unit';
 if(/unknown|incomplete/.test(text))return 'incomplete_nutrition';
 return 'calculation_error';
}

function finalizeSnapshot(snapshot){
 if(!snapshot)return null;
 const issues=[...(snapshot.issues||[])];
 if(!validTotals(snapshot.nutrition))issues.push('Calculated nutrition contains an invalid, negative, or non-finite value.');
 const nutrition_known=issues.length===0?1:0;
 return {...snapshot,issues,nutrition_known,status:classifyIssues(issues),calculated_at:new Date().toISOString()};
}

export function getRecipeNutrition(runQuery,recipeId){
 const id=String(recipeId??'').replace(/^recipe:/i,'');
 const meal=runQuery('SELECT * FROM meal_definitions WHERE meal_id=? LIMIT 1',[`recipe:${id}`])[0]
  ||runQuery("SELECT * FROM meal_definitions WHERE source_type IN ('recipe','legacy_recipe') AND CAST(source_id AS TEXT)=CAST(? AS TEXT) LIMIT 1",[id])[0];
 if(meal){
  const snapshot=getMealNutrition(runQuery,meal.meal_id);
  if(!snapshot)return null;
  return {...snapshot,type:'recipe',recipe_id:id,recipe_name:meal.title,ingredients:snapshot.components};
 }
 // Import/audit compatibility only: installations without a canonical meal definition
 // may still be inspected, but active application paths always resolve meal_components.
 const rows=runQuery(`SELECT * FROM recipes WHERE recipe_id=? OR recipe_name=(SELECT recipe_name FROM recipes WHERE recipe_id=? LIMIT 1) ORDER BY id`,[id,id]);
 if(!rows.length)return null;
 const foods=runQuery('SELECT * FROM foods WHERE COALESCE(archived,0)=0 ORDER BY food_id');
 return finalizeSnapshot(buildRecipeSnapshot(rows,foods));
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
 const identities=new Set();

 for(const component of components){
  const amount=Number(component.amount);
  const identity=`${component.component_type||''}:${String(component.component_id||component.component_name||'').trim().toLowerCase()}`;
  if(identities.has(identity))issues.push(`${component.component_name}: duplicate Meal component.`);
  identities.add(identity);
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
   const scaling=scaleFoodQuantity({amount,amountUnit:component.unit||food.unit,food});
   if(!scaling.ok){const issue=`${component.component_name}: ${scaling.reason}`;issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;}
   nutrition=Object.fromEntries(NUTRIENT_KEYS.map(key=>[key,finite(food[key])*scaling.ratio]));
  }else{
   const issue=`${component.component_name}: unsupported component type ${component.component_type||'missing'}.`;
   issues.push(issue);resolvedComponents.push({...component,resolved:false,issue});continue;
  }
  for(const key of NUTRIENT_KEYS)total[key]+=finite(nutrition[key]);
  resolvedComponents.push({...component,resolved:true,nutrition,...nutrition});
 }

 return finalizeSnapshot({type:'meal',meal_id:meal.meal_id,title:meal.title,components:resolvedComponents,nutrition:total,issues:components.length?issues:['Meal has no components.'],serving:1,unit:'meal'});
}

export function getAggregateNutrition(runQuery,type,id){
 if(type==='recipe')return getRecipeNutrition(runQuery,id);
 if(type==='meal')return getMealNutrition(runQuery,id);
 throw new Error(`Unsupported aggregate nutrition type: ${type}`);
}

export function auditAggregateNutrition(runQuery){
 const recipes=runQuery(`SELECT recipe_id,MAX(recipe_name) recipe_name FROM recipes WHERE COALESCE(archived,0)=0 GROUP BY recipe_id ORDER BY recipe_name COLLATE NOCASE`).map(row=>{
  const snapshot=getRecipeNutrition(runQuery,row.recipe_id);
  return {type:'recipe',id:row.recipe_id,name:row.recipe_name,status:snapshot?.status||'calculation_error',valid:Number(snapshot?.nutrition_known)===1,ingredient_count:snapshot?.ingredients?.length||0,resolved_count:snapshot?.ingredients?.filter(x=>x.resolved).length||0,issues:snapshot?.issues||['Recipe could not be calculated.'],nutrition:snapshot?.nutrition||null};
 });
 const meals=runQuery(`SELECT meal_id,title FROM meal_definitions WHERE COALESCE(archived,0)=0 ORDER BY title COLLATE NOCASE`).map(row=>{
  const snapshot=getMealNutrition(runQuery,row.meal_id);
  return {type:'meal',id:row.meal_id,name:row.title,status:snapshot?.status||'calculation_error',valid:Number(snapshot?.nutrition_known)===1,component_count:snapshot?.components?.length||0,resolved_count:snapshot?.components?.filter(x=>x.resolved).length||0,issues:snapshot?.issues||['Meal could not be calculated.'],nutrition:snapshot?.nutrition||null};
 });
 const all=[...recipes,...meals];
 const by_status=all.reduce((out,item)=>({...out,[item.status]:(out[item.status]||0)+1}),{});
 return {recipes,meals,valid:all.filter(x=>x.valid).length,invalid:all.filter(x=>!x.valid).length,total:all.length,by_status,generated_at:new Date().toISOString()};
}
