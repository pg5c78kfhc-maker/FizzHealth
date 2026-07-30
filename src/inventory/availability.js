import {pantryAvailableQuantity} from './quantity.js';

const key=value=>String(value??'').trim().toLowerCase();
const recipeKey=value=>key(value).replace(/^recipe:/,'');

export function buildAvailabilityIndex({pantryRows=[],recipeRows=[],mealComponents=[],mealDefinitions=[]}={}){
  const pantryStates=new Map();
  const pantryRecords=new Map();
  for(const row of pantryRows){
    if(Number(row?.discontinued)===1)continue;
    const aliases=[...new Set([key(row?.food_id),key(row?.item)].filter(Boolean))];
    if(!aliases.length)continue;
    const quantity=Math.max(0,Number(row?.quantity)||0);
    for(const alias of aliases){
      const existing=pantryStates.get(alias);
      if(existing)existing.total+=quantity;
      else pantryStates.set(alias,{tracked:true,total:quantity});
      if(!pantryRecords.has(alias))pantryRecords.set(alias,[]);
      pantryRecords.get(alias).push(row);
    }
  }
  const recipesById=new Map();
  for(const row of recipeRows){
    const id=recipeKey(row?.recipe_id);
    if(!id)continue;
    if(!recipesById.has(id))recipesById.set(id,[]);
    recipesById.get(id).push(row);
  }
  const recipeTrackingById=new Map();
  for(const row of mealDefinitions){
    if(String(row?.source_type||'').toLowerCase()!=='legacy_recipe')continue;
    const id=recipeKey(row?.source_id||row?.meal_id);
    if(id)recipeTrackingById.set(id,Number(row?.track_inventory)===1);
  }
  const mealComponentsById=new Map();
  for(const row of mealComponents){
    const id=key(row?.meal_id);
    if(!id)continue;
    if(!mealComponentsById.has(id))mealComponentsById.set(id,[]);
    mealComponentsById.get(id).push(row);
  }
  const pantryState=(id,name)=>pantryStates.get(key(id))||pantryStates.get(key(name))||null;
  const foodAvailable=(id,name)=>{const state=pantryState(id,name);return !state||state.total>0};
  const ingredientSufficient=(id,name,amount=0,unit='')=>{
    const records=pantryRecords.get(key(id))||pantryRecords.get(key(name));
    if(!records)return true;
    const required=Number(amount)||0;
    if(required<=0)return records.some(row=>(Number(row.quantity)||0)>0);
    const total=records.reduce((sum,row)=>sum+pantryAvailableQuantity(row,unit),0);
    return total+1e-9>=required;
  };
  const recipeCanPrepare=(id,seen=new Set())=>{
    const recipeId=recipeKey(id);if(!recipeId||seen.has(recipeId))return false;
    const nextSeen=new Set(seen).add(recipeId);
    const rows=recipesById.get(recipeId)||[];
    return rows.length>0&&rows.every(row=>{
      const type=key(row.ingredient_type||'food');
      if(type==='recipe')return recipeAvailable(row.ingredient_id,row.ingredient_name,nextSeen);
      return ingredientSufficient(row.ingredient_id,row.ingredient_name,row.amount,row.unit);
    });
  };
  // Tracked Recipes require prepared inventory. Untracked Recipes are available
  // when their required tracked ingredients are available in sufficient quantities.
  const recipeAvailable=(id,name,seen=new Set())=>{
    const recipeId=recipeKey(id);
    if(!recipeId)return false;
    const prepared=pantryState(`recipe:${recipeId}`,name);
    if(recipeTrackingById.get(recipeId)===true)return Boolean(prepared&&prepared.total>0);
    return recipeCanPrepare(recipeId,seen);
  };
  const mealAvailable=(id,seen=new Set())=>{
    const mealId=key(id);if(!mealId||seen.has(mealId))return true;
    if(mealId.startsWith('recipe:'))return recipeAvailable(mealId);
    const nextSeen=new Set(seen).add(mealId);
    return (mealComponentsById.get(mealId)||[]).filter(row=>Number(row.optional)!==1).every(row=>{
      const type=key(row.component_type||'food');
      if(type==='recipe')return recipeAvailable(row.component_id,row.component_name);
      if(type==='meal')return mealAvailable(row.component_id,nextSeen);
      return foodAvailable(row.component_id,row.component_name);
    });
  };
  const itemAvailable=item=>{
    const classification=key(item?.classification);
    const type=classification==='recipe'?'recipe':key(item?.planner_source||item?.source_type||item?.type||'food');
    if(type==='meal')return mealAvailable(item?.meal_id||item?.id);
    if(type==='recipe')return recipeAvailable(item?.source_id||item?.recipe_id||item?.meal_id||item?.id,item?.title||item?.recipe_name||item?.name);
    if(type==='restaurant')return true;
    return foodAvailable(item?.meal_id||item?.food_id||item?.id,item?.title||item?.name||item?.item);
  };
  return {pantryState,foodAvailable,ingredientSufficient,recipeAvailable,recipeCanPrepare,mealAvailable,itemAvailable};
}
