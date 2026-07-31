import {canonicalUnit,convertQuantity,scaleFoodQuantity} from '../nutrition/units.js';

const EPSILON=1e-9;
const number=value=>Number.isFinite(Number(value))?Number(value):0;
const optionalNumber=value=>value===null||value===undefined||String(value).trim()===''?null:(Number.isFinite(Number(value))?Number(value):null);
const containerUnits=new Set(['each','bag','bottle','box','can','carton','container','jar','package','pack','tub']);

function firstNumber(...values){
 for(const value of values){const parsed=optionalNumber(value);if(parsed!==null)return parsed}
 return null;
}

export function foodDefinition(row={}){
 return {
  name:row.food_name||row.item||row.name||'',
  default_serving:firstNumber(row.default_serving,row.serving_size)||0,
  unit:row.food_unit||row.serving_unit||'',
  serving_description:row.serving_description||''
 };
}

export function isContainerInventory(row={}){
 const packageType=String(row.package_type||'').trim().toLowerCase();
 const inventoryUnit=canonicalUnit(row.unit||'');
 return packageType==='container'||packageType==='package'||row.package_count!==null&&row.package_count!==undefined&&String(row.package_count).trim()!==''||containerUnits.has(inventoryUnit);
}

export function inventoryModel(row={}){
 const food=foodDefinition(row);
 const containerMode=isContainerInventory(row);
 const containerCount=Math.max(0,firstNumber(row.package_count,containerMode?row.quantity:null)||0);
 const servingsPerContainer=Math.max(0,firstNumber(row.servings_per_package,row.inventory_servings_per_package,row.food_servings_per_container)||0);
 const partialValue=optionalNumber(row.partial_package_quantity);
 const hasOpenContainer=partialValue!==null&&partialValue>EPSILON;
 const openAmount=hasOpenContainer?Math.max(0,partialValue):0;
 const fullContainers=Math.max(0,containerCount-(hasOpenContainer?1:0));
 let availableServings=null,directAmount=null,directUnit='';
 if(containerMode&&servingsPerContainer>0)availableServings=fullContainers*servingsPerContainer+openAmount;
 else if(containerMode){
  const size=Math.max(0,firstNumber(row.container_size)||0),unit=String(row.container_unit||'').trim();
  if(size>0&&unit){directAmount=fullContainers*size+openAmount;directUnit=unit}
 }
 if(!containerMode){
  directAmount=Math.max(0,number(row.quantity));directUnit=String(row.unit||'').trim();
  const direct=scaleFoodQuantity({amount:directAmount,amountUnit:directUnit,food});
  if(direct.ok)availableServings=Math.max(0,direct.ratio);
 }
 return {food,containerMode,containerCount,servingsPerContainer,hasOpenContainer,openAmount,openServings:openAmount,fullContainers,availableServings:availableServings===null?null:Math.max(0,availableServings),directAmount,directUnit};
}

export function inventoryAvailableServings(row={}){
 if(Number(row.discontinued)===1)return 0;
 const model=inventoryModel(row);
 return model.availableServings??0;
}

export function inventoryHasStock(row={}){
 if(Number(row.discontinued)===1)return false;
 const model=inventoryModel(row);
 return (model.availableServings??0)>EPSILON||(model.directAmount??0)>EPSILON;
}

function servingsForRequest(amount,unit,row={}){
 const requested=Math.max(0,number(amount));
 if(requested<=0)return 0;
 const scaled=scaleFoodQuantity({amount:requested,amountUnit:unit,food:foodDefinition(row)});
 return scaled.ok?scaled.ratio:null;
}

export function inventoryAvailableQuantity(row={},targetUnit='serving'){
 if(Number(row.discontinued)===1)return 0;
 const model=inventoryModel(row),target=canonicalUnit(targetUnit);
 if(model.availableServings!==null){
  if(!target||target==='serving')return model.availableServings;
  const food=model.food;
  const convertedServing=convertQuantity(food.default_serving,food.unit,targetUnit);
  if(convertedServing!=null)return Math.max(0,model.availableServings*convertedServing);
  const targetRatio=servingsForRequest(1,targetUnit,row);
  if(targetRatio!==null&&targetRatio>EPSILON)return Math.max(0,model.availableServings/targetRatio);
 }
 if(model.directAmount!==null){
  const converted=convertQuantity(model.directAmount,model.directUnit,targetUnit);
  if(converted!=null)return Math.max(0,converted);
 }
 return 0;
}

export function inventorySufficient(rows=[],amount=0,unit='serving'){
 const required=Math.max(0,number(amount));
 if(required<=0)return rows.some(row=>inventoryAvailableServings(row)>EPSILON);
 const available=rows.reduce((sum,row)=>sum+inventoryAvailableQuantity(row,unit),0);
 return available+EPSILON>=required;
}

export function consumeInventory(row={},amount=0,amountUnit='serving'){
 const required=Math.max(0,number(amount)),model=inventoryModel(row);
 if(required<=0)return {ok:true,used:0,usedServings:0,remaining:inventoryAvailableQuantity(row,amountUnit),updates:{}};
 if(model.availableServings!==null){
  const requiredServings=servingsForRequest(required,amountUnit,row);
  if(requiredServings===null||model.availableServings+EPSILON<requiredServings)return {ok:false,used:0,usedServings:0,remaining:inventoryAvailableQuantity(row,amountUnit),updates:{}};
  const remainingServings=Math.max(0,model.availableServings-requiredServings);
  if(model.containerMode&&model.servingsPerContainer>0){
   const fullContainers=Math.floor((remainingServings+EPSILON)/model.servingsPerContainer);
   const partialServings=Math.max(0,remainingServings-fullContainers*model.servingsPerContainer);
   const packageCount=fullContainers+(partialServings>EPSILON?1:0);
   return {ok:true,used:required,usedServings:requiredServings,remaining:inventoryAvailableQuantity({...row,quantity:packageCount,package_count:packageCount,unopened_packages:fullContainers,partial_package_quantity:partialServings>EPSILON?partialServings:null},amountUnit),updates:{quantity:packageCount,package_count:packageCount,unopened_packages:fullContainers,partial_package_quantity:partialServings>EPSILON?partialServings:null,opened:partialServings>EPSILON?'Yes':'No',on_hand:remainingServings>EPSILON?'Yes':'No',status:remainingServings>EPSILON?'Active':'Out of Stock'}};
  }
  const food=model.food,remainingInFoodUnit=remainingServings*food.default_serving,nextQuantity=convertQuantity(remainingInFoodUnit,food.unit,row.unit);
  if(nextQuantity==null)return {ok:false,used:0,usedServings:0,remaining:inventoryAvailableQuantity(row,amountUnit),updates:{}};
  return {ok:true,used:required,usedServings:requiredServings,remaining:inventoryAvailableQuantity({...row,quantity:nextQuantity},amountUnit),updates:{quantity:Math.max(0,nextQuantity),on_hand:remainingServings>EPSILON?'Yes':'No',status:remainingServings>EPSILON?'Active':'Out of Stock'}};
 }
 if(model.directAmount!==null){
  const requiredDirect=convertQuantity(required,amountUnit,model.directUnit);
  if(requiredDirect==null||model.directAmount+EPSILON<requiredDirect)return {ok:false,used:0,usedServings:0,remaining:inventoryAvailableQuantity(row,amountUnit),updates:{}};
  const next=Math.max(0,model.directAmount-requiredDirect);
  if(model.containerMode){
   const size=Math.max(0,firstNumber(row.container_size)||0);
   let need=requiredDirect,partial=model.hasOpenContainer?model.openAmount:0,full=model.fullContainers;
   const fromPartial=Math.min(partial,need);partial-=fromPartial;need-=fromPartial;
   while(need>EPSILON&&full>0){full-=1;if(need>=size-EPSILON)need-=size;else{partial=size-need;need=0}}
   const packageCount=full+(partial>EPSILON?1:0);
   return {ok:true,used:required,usedServings:0,remaining:convertQuantity(full*size+partial,model.directUnit,amountUnit)??0,updates:{quantity:packageCount,package_count:packageCount,unopened_packages:full,partial_package_quantity:partial>EPSILON?partial:null,opened:partial>EPSILON?'Yes':'No',on_hand:next>EPSILON?'Yes':'No',status:next>EPSILON?'Active':'Out of Stock'}};
  }
  return {ok:true,used:required,usedServings:0,remaining:convertQuantity(next,model.directUnit,amountUnit)??0,updates:{quantity:next,on_hand:next>EPSILON?'Yes':'No',status:next>EPSILON?'Active':'Out of Stock'}};
 }
 return {ok:false,used:0,usedServings:0,remaining:0,updates:{}};
}

// Backward-compatible names. All callers resolve to this single implementation.
export const pantryAvailableQuantity=inventoryAvailableQuantity;
export const consumePantryQuantity=consumeInventory;
