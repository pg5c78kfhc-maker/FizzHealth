import {canonicalUnit,convertQuantity} from '../nutrition/units.js';

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
  // The approved inventory model is authoritative:
  // blank partial quantity means every container is full;
  // a positive partial quantity means one container is open and all others are full.
  const unopened=Math.max(0,count-(hasPartial?1:0));
  return {size,unit,count,partial,unopened,hasPartial};
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
    const servingsPerPackage=Math.max(0,number(row.servings_per_package||row.inventory_servings_per_package||row.food_servings_per_container));
    const servingSize=Math.max(0,number(row.default_serving));
    const servingUnit=String(row.food_unit||'').trim();
    if(servingsPerPackage>0&&servingSize>0&&servingUnit){
      const {partial,unopened}=packageParts(row);
      const availableServings=unopened*servingsPerPackage+partial;
      const converted=convertQuantity(availableServings*servingSize,servingUnit,target);
      if(converted!=null)return Math.max(0,converted);
    }
  }

  const direct=convertQuantity(number(row.quantity),row.unit,target);
  return direct==null?0:Math.max(0,direct);
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
  }

  const rowAmount=convertQuantity(required,amountUnit,row.unit);
  if(rowAmount==null)return {ok:false,used:0,remaining:pantryAvailableQuantity(row,amountUnit),updates:{}};
  const next=Math.max(0,number(row.quantity)-rowAmount);
  return {ok:true,used:required,remaining:convertQuantity(next,row.unit,amountUnit)??0,updates:{quantity:next,on_hand:next>1e-9?'Yes':'No',status:next>1e-9?'Active':'Out of Stock'}};
}
