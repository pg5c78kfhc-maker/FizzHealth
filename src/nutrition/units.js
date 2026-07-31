const UNIT_ALIASES = new Map([
  ['g','g'],['gram','g'],['grams','g'],
  ['mg','mg'],['milligram','mg'],['milligrams','mg'],
  ['kg','kg'],['kilogram','kg'],['kilograms','kg'],
  ['oz','oz'],['ounce','oz'],['ounces','oz'],
  ['lb','lb'],['lbs','lb'],['pound','lb'],['pounds','lb'],
  ['ml','ml'],['milliliter','ml'],['milliliters','ml'],['millilitre','ml'],['millilitres','ml'],
  ['l','l'],['liter','l'],['liters','l'],['litre','l'],['litres','l'],
  ['fl oz','floz'],['fl. oz','floz'],['fluid ounce','floz'],['fluid ounces','floz'],['floz','floz'],
  ['tbsp','tbsp'],['tablespoon','tbsp'],['tablespoons','tbsp'],
  ['tsp','tsp'],['teaspoon','tsp'],['teaspoons','tsp'],
  ['cup','cup'],['cups','cup'],
  ['serving','serving'],['servings','serving'],['recipe','recipe'],['recipes','recipe']
]);

const MASS_TO_G = {mg:0.001,g:1,kg:1000,oz:28.349523125,lb:453.59237};
const VOLUME_TO_ML = {ml:1,l:1000,floz:29.5735295625,tbsp:14.78676478125,tsp:4.92892159375,cup:236.5882365};

export function canonicalUnit(value){
  const normalized=String(value??'').trim().toLowerCase().replace(/\s+/g,' ');
  if(UNIT_ALIASES.has(normalized))return UNIT_ALIASES.get(normalized);
  const singular=normalized.replace(/s$/,'');
  return UNIT_ALIASES.get(singular)||singular;
}

export function convertQuantity(amount,fromUnit,toUnit){
  const value=Number(amount);
  if(!Number.isFinite(value))return null;
  const from=canonicalUnit(fromUnit),to=canonicalUnit(toUnit);
  if(!from||!to||from===to)return value;
  if(MASS_TO_G[from]&&MASS_TO_G[to])return value*MASS_TO_G[from]/MASS_TO_G[to];
  if(VOLUME_TO_ML[from]&&VOLUME_TO_ML[to])return value*VOLUME_TO_ML[from]/VOLUME_TO_ML[to];
  return null;
}


const normalizedMeasure=value=>String(value??'').trim().toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[^a-z0-9.]+/g,' ').replace(/\s+/g,' ').trim();

function parseCommonMeasure(value){
  const text=normalizedMeasure(value);
  if(!text)return null;
  const match=text.match(/^(\d+(?:\.\d+)?|\.\d+)\s+(.+)$/);
  if(!match)return {amount:1,unit:text};
  const amount=Number(match[1]);
  return Number.isFinite(amount)&&amount>0?{amount,unit:match[2]}:null;
}

function measureMatches(requested,common){
  const a=normalizedMeasure(requested),b=normalizedMeasure(common);
  if(!a||!b)return false;
  if(a===b)return true;
  const at=new Set(a.split(' ')),bt=new Set(b.split(' '));
  return [...at].every(token=>bt.has(token))||[...bt].every(token=>at.has(token));
}

function foodSpecificMeasureMatches(requested,food){
  const measure=normalizedMeasure(requested);
  if(!measure)return false;
  const name=normalizedMeasure(food?.name);
  if(!name)return false;
  const ignored=new Set(['fresh','whole','large','medium','small','cooked','raw','prepared','organic','frozen','dried','chopped','sliced']);
  const singularToken=token=>token.endsWith('ies')?`${token.slice(0,-3)}y`:token.endsWith('ses')?token.slice(0,-2):token.endsWith('s')&&!token.endsWith('ss')?token.slice(0,-1):token;
  const measureTokens=measure.split(' ').map(singularToken).filter(token=>token&&!ignored.has(token));
  const nameTokens=new Set(name.split(' ').map(singularToken).filter(token=>token&&!ignored.has(token)));
  return measureTokens.length>0&&measureTokens.every(token=>nameTokens.has(token));
}

export function scaleFoodQuantity({amount,amountUnit,food}){
  const servingAmount=Number(food?.default_serving);
  const servingUnit=food?.unit;
  if(!Number.isFinite(servingAmount)||servingAmount<=0)return {ok:false,reason:'Food serving size is missing or invalid.'};
  const direct=convertQuantity(amount,amountUnit,servingUnit);
  if(direct!=null)return {ok:true,ratio:direct/servingAmount,convertedAmount:direct,method:'direct'};
  const common=parseCommonMeasure(food?.serving_description);
  if(common&&measureMatches(amountUnit,common.unit)){
    const value=Number(amount);
    if(!Number.isFinite(value))return {ok:false,reason:'Ingredient quantity is missing or invalid.'};
    return {ok:true,ratio:value/common.amount,convertedAmount:value,method:'common_measure'};
  }
  if(foodSpecificMeasureMatches(amountUnit,food)){
    const value=Number(amount);
    if(!Number.isFinite(value))return {ok:false,reason:'Ingredient quantity is missing or invalid.'};
    return {ok:true,ratio:value,convertedAmount:value,method:'food_specific_serving'};
  }
  return {ok:false,reason:`Cannot convert ${amountUnit||'unknown unit'} to ${servingUnit||'unknown unit'} using the Food serving definition.`};
}

export function foodQuantityToGrams({amount,amountUnit,food}){
  const scaling=scaleFoodQuantity({amount,amountUnit,food});
  if(!scaling.ok)return scaling;
  const servingGrams=convertQuantity(food?.default_serving,food?.unit,'g');
  if(servingGrams==null)return {ok:false,reason:'Food serving definition does not resolve to grams.'};
  return {...scaling,grams:servingGrams*scaling.ratio};
}

export function scaleForServing({amount,amountUnit,servingAmount,servingUnit}){
  const serving=Number(servingAmount);
  if(!Number.isFinite(serving)||serving<=0)return {ok:false,reason:'Food serving size is missing or invalid.'};
  const converted=convertQuantity(amount,amountUnit,servingUnit);
  if(converted==null)return {ok:false,reason:`Cannot convert ${amountUnit||'unknown unit'} to ${servingUnit||'unknown unit'}.`};
  return {ok:true,ratio:converted/serving,convertedAmount:converted};
}
