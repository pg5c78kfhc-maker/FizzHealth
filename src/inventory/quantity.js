import {canonicalUnit,convertQuantity,scaleFoodQuantity} from '../nutrition/units.js';

const number=value=>Number.isFinite(Number(value))?Number(value):0;
const packageUnits=new Set(['each','bag','bags','bottle','bottles','box','boxes','can','cans','carton','cartons','jar','jars','package','packages','tub','tubs']);

export function isPackageInventoryRow(row={}){
  return Boolean(String(row.package_type||'').trim())||packageUnits.has(String(row.unit||'').trim().toLowerCase());
}

function packageParts(row={}){
  const size=Math.max(0,number(row.container_size));
  const unit=String(row.container_unit||row.food_unit||'').trim();
  const count=Math.max(0,number(row.package_count||row.quantity));
  const hasPartial=row.partial_package_quantity!==null&&row.partial_package_quantity!==undefined&&String(row.partial_package_quantity).trim()!==''&&number(row.partial_package_quantity)>0;
  const partial=hasPartial?Math.max(0,number(row.partial_package_quantity)):0;
  const unopened=Math.max(0,count-(hasPartial?1:0));
  return {size,unit,count,partial,unopened,hasPartial};
}

function foodDefinition(row={}){
  return {
    name:row.food_name||row.item||row.name||'',
    default_serving:number(row.default_serving),
    unit:row.food_unit||row.serving_unit||'',
    serving_description:row.serving_description||''
  };
}

function servingRatioFor(amount,amountUnit,row={}){
  const food=foodDefinition(row);
  if(!(food.default_serving>0)||!food.unit)return null;
  const scaled=scaleFoodQuantity({amount,amountUnit,food});
  return scaled.ok?scaled.ratio:null;
}

function availableServingsForPackage(row={}){
  const servingsPerPackage=Math.max(0,number(row.servings_per_package||row.inventory_servings_per_package||row.food_servings_per_container));
  if(!(servingsPerPackage>0))return null;
  const {partial,unopened}=packageParts(row);
  return unopened*servingsPerPackage+partial;
}

export function pantryAvailableQuantity(row={},targetUnit=''){
  if(Number(row.discontinued)===1)return 0;
  const target=canonicalUnit(targetUnit);
  if(!target)return 0;

  if(isPackageInventoryRow(row)){
    const {size,unit,partial,unopened}=packageParts(row);
    if(size>0&&unit){
      const converted=convertQuantity(unopened*size+partial,unit,target);
      if(converted!=null)return Math.max(0,converted);
    }
    const availableServings=availableServingsForPackage(row);
    const servingSize=Math.max(0,number(row.default_serving));
    const servingUnit=String(row.food_unit||'').trim();
    if(availableServings!=null&&servingSize>0&&servingUnit){
      const converted=convertQuantity(availableServings*servingSize,servingUnit,target);
      if(converted!=null)return Math.max(0,converted);
      const targetRatio=servingRatioFor(1,targetUnit,row);
      if(targetRatio!=null&&targetRatio>0)return Math.max(0,availableServings/targetRatio);
    }
  }

  const direct=convertQuantity(number(row.quantity),row.unit,target);
  if(direct!=null)return Math.max(0,direct);
  const rowServingRatio=servingRatioFor(number(row.quantity),row.unit,row);
  const targetRatio=servingRatioFor(1,targetUnit,row);
  if(rowServingRatio!=null&&targetRatio!=null&&targetRatio>0)return Math.max(0,rowServingRatio/targetRatio);
  return 0;
}

export function consumePantryQuantity(row={},amount=0,amountUnit=''){
  const required=Math.max(0,number(amount));
  if(required<=0)return {ok:true,used:0,remaining:pantryAvailableQuantity(row,amountUnit),updates:{}};

  if(isPackageInventoryRow(row)){
    const parts=packageParts(row);
    const requiredContainer=convertQuantity(required,amountUnit,parts.unit);
    if(parts.size>0&&parts.unit&&requiredContainer!=null){
      const total=parts.unopened*parts.size+parts.partial;
      if(total+1e-9<requiredContainer)return {ok:false,used:0,remaining:total,updates:{}};
      let need=requiredContainer;
      let partial=parts.partial;
      let unopened=parts.unopened;
      const fromPartial=Math.min(partial,need);
      partial-=fromPartial;need-=fromPartial;
      while(need>1e-9&&unopened>0){
        unopened-=1;
        if(need>=parts.size-1e-9)need-=parts.size;
        else {partial=parts.size-need;need=0;}
      }
      const packageCount=unopened+(partial>1e-9?1:0);
      return {ok:true,used:required,remaining:convertQuantity(unopened*parts.size+partial,parts.unit,amountUnit)??0,updates:{quantity:packageCount,package_count:packageCount,unopened_packages:unopened,partial_package_quantity:partial,on_hand:packageCount>0?'Yes':'No',status:packageCount>0?'Active':'Out of Stock'}};
    }

    const servingsPerPackage=Math.max(0,number(row.servings_per_package||row.inventory_servings_per_package||row.food_servings_per_container));
    const availableServings=availableServingsForPackage(row);
    const requiredServings=servingRatioFor(required,amountUnit,row);
    if(servingsPerPackage>0&&availableServings!=null&&requiredServings!=null){
      if(availableServings+1e-9<requiredServings)return {ok:false,used:0,remaining:pantryAvailableQuantity(row,amountUnit),updates:{}};
      const nextServings=Math.max(0,availableServings-requiredServings);
      const fullPackages=Math.floor((nextServings+1e-9)/servingsPerPackage);
      const partialServings=Math.max(0,nextServings-fullPackages*servingsPerPackage);
      const packageCount=fullPackages+(partialServings>1e-9?1:0);
      const targetRatio=servingRatioFor(1,amountUnit,row);
      return {ok:true,used:required,remaining:targetRatio&&targetRatio>0?nextServings/targetRatio:0,updates:{quantity:packageCount,package_count:packageCount,unopened_packages:fullPackages,partial_package_quantity:partialServings,on_hand:packageCount>0?'Yes':'No',status:packageCount>0?'Active':'Out of Stock'}};
    }
  }

  const rowAmount=convertQuantity(required,amountUnit,row.unit);
  if(rowAmount!=null){
    const next=Math.max(0,number(row.quantity)-rowAmount);
    return {ok:true,used:required,remaining:convertQuantity(next,row.unit,amountUnit)??0,updates:{quantity:next,on_hand:next>1e-9?'Yes':'No',status:next>1e-9?'Active':'Out of Stock'}};
  }
  const requiredServings=servingRatioFor(required,amountUnit,row);
  const rowServings=servingRatioFor(number(row.quantity),row.unit,row);
  if(requiredServings==null||rowServings==null||rowServings+1e-9<requiredServings)return {ok:false,used:0,remaining:pantryAvailableQuantity(row,amountUnit),updates:{}};
  const remainingServings=Math.max(0,rowServings-requiredServings);
  const food=foodDefinition(row);
  const nextQuantity=convertQuantity(remainingServings*food.default_serving,food.unit,row.unit);
  if(nextQuantity==null)return {ok:false,used:0,remaining:pantryAvailableQuantity(row,amountUnit),updates:{}};
  return {ok:true,used:required,remaining:pantryAvailableQuantity({...row,quantity:nextQuantity},amountUnit),updates:{quantity:nextQuantity,on_hand:nextQuantity>1e-9?'Yes':'No',status:nextQuantity>1e-9?'Active':'Out of Stock'}};
}
