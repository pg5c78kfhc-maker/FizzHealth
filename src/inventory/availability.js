const key=value=>String(value??'').trim().toLowerCase();

export function buildAvailabilityIndex({pantryRows=[],recipeRows=[],mealComponents=[]}={}){
  const pantryStates=new Map();
  for(const row of pantryRows){
    if(Number(row?.discontinued)===1)continue;
    const aliases=[...new Set([key(row?.food_id),key(row?.item)].filter(Boolean))];
    if(!aliases.length)continue;
    const state={tracked:true,total:Math.max(0,Number(row?.quantity)||0)};
    for(const alias of aliases){
      const existing=pantryStates.get(alias);
      if(existing)existing.total+=state.total;
      else pantryStates.set(alias,{...state});
    }
  }
  const recipesById=new Map();
  for(const row of recipeRows){
    const id=key(row?.recipe_id);
    if(!id)continue;
    if(!recipesById.has(id))recipesById.set(id,[]);
    recipesById.get(id).push(row);
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
  const recipeAvailable=(id,name,seen=new Set())=>{
    const recipeId=key(id);if(!recipeId)return true;
    const prepared=pantryState(`recipe:${recipeId}`);
    if(prepared)return prepared.total>0;
    if(seen.has(recipeId))return true;
    const nextSeen=new Set(seen).add(recipeId);
    return (recipesById.get(recipeId)||[]).every(row=>{
      const type=key(row.ingredient_type||'food');
      if(type==='recipe')return recipeAvailable(row.ingredient_id,row.ingredient_name,nextSeen);
      return foodAvailable(row.ingredient_id,row.ingredient_name);
    });
  };
  const mealAvailable=(id,seen=new Set())=>{
    const mealId=key(id);if(!mealId||seen.has(mealId))return true;
    const nextSeen=new Set(seen).add(mealId);
    return (mealComponentsById.get(mealId)||[]).filter(row=>Number(row.optional)!==1).every(row=>{
      const type=key(row.component_type||'food');
      if(type==='recipe')return recipeAvailable(row.component_id,row.component_name,nextSeen);
      if(type==='meal')return mealAvailable(row.component_id,nextSeen);
      return foodAvailable(row.component_id,row.component_name);
    });
  };
  const itemAvailable=item=>{
    const type=key(item?.planner_source||item?.source_type||item?.type||'food');
    if(type==='meal')return mealAvailable(item?.meal_id||item?.id);
    if(type==='recipe')return recipeAvailable(item?.meal_id||item?.recipe_id||item?.id,item?.title||item?.recipe_name||item?.name);
    if(type==='restaurant')return true;
    return foodAvailable(item?.meal_id||item?.food_id||item?.id,item?.title||item?.name||item?.item);
  };
  return {pantryState,foodAvailable,recipeAvailable,mealAvailable,itemAvailable};
}
