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

export function scaleForServing({amount,amountUnit,servingAmount,servingUnit}){
  const serving=Number(servingAmount);
  if(!Number.isFinite(serving)||serving<=0)return {ok:false,reason:'Food serving size is missing or invalid.'};
  const converted=convertQuantity(amount,amountUnit,servingUnit);
  if(converted==null)return {ok:false,reason:`Cannot convert ${amountUnit||'unknown unit'} to ${servingUnit||'unknown unit'}.`};
  return {ok:true,ratio:converted/serving,convertedAmount:converted};
}
