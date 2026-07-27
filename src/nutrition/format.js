const rounded=value=>{const number=Number(value);return Number.isFinite(number)?Math.round(number):null};
export const formatCalories=value=>{const number=rounded(value);return number==null?'—':String(number)};
export const formatGrams=value=>{const number=rounded(value);return number==null?'—':`${number}g`};
export const formatMilligrams=value=>{const number=rounded(value);return number==null?'—':`${number}mg`};
export const formatMicrograms=value=>{const number=rounded(value);return number==null?'—':`${number}mcg`};
export const formatNutritionValue=(value,unit='')=>{const normalized=String(unit).toLowerCase();if(normalized==='kcal'||normalized==='calories')return formatCalories(value);if(normalized==='g'||normalized==='gram'||normalized==='grams')return formatGrams(value);if(normalized==='mg')return formatMilligrams(value);if(normalized==='mcg'||normalized==='µg')return formatMicrograms(value);const number=rounded(value);return number==null?'—':`${number}${unit?` ${unit}`:''}`};
