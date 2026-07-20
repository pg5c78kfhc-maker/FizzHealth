export const NUTRIENTS = Object.freeze([
 {key:'calories',label:'Calories',unit:'kcal',behavior:'budget',ldl:false,aliases:['calories','energy_kcal']},
 {key:'protein',label:'Protein',unit:'g',behavior:'goal',ldl:false,aliases:['protein','protein_g']},
 {key:'carbs',label:'Carbohydrates',unit:'g',behavior:'budget',ldl:false,aliases:['carbs','carbohydrate_g','total_carbohydrate_g']},
 {key:'fiber',label:'Fiber',unit:'g',behavior:'goal',ldl:true,aliases:['fiber','fiber_g','dietary_fiber_g']},
 {key:'fat',label:'Total fat',unit:'g',behavior:'budget',ldl:true,aliases:['fat','total_fat_g']},
 {key:'saturated_fat',label:'Saturated fat',unit:'g',behavior:'limit',ldl:true,aliases:['saturated_fat','saturated_fat_g']},
 {key:'trans_fat',label:'Trans fat',unit:'g',behavior:'limit',ldl:true,aliases:['trans_fat','trans_fat_g']},
 {key:'cholesterol',label:'Cholesterol',unit:'mg',behavior:'limit',ldl:true,aliases:['cholesterol','cholesterol_mg']},
 {key:'sodium',label:'Sodium',unit:'mg',behavior:'limit',ldl:false,aliases:['sodium','sodium_mg']},
 {key:'potassium',label:'Potassium',unit:'mg',behavior:'goal',ldl:false,aliases:['potassium','potassium_mg']},
 {key:'total_sugar',label:'Total sugar',unit:'g',behavior:'budget',ldl:false,aliases:['total_sugar','total_sugars_g']},
 {key:'added_sugar',label:'Added sugar',unit:'g',behavior:'limit',ldl:false,aliases:['added_sugar','added_sugars_g']},
 {key:'monounsaturated_fat',label:'Monounsaturated fat',unit:'g',behavior:'goal',ldl:true,aliases:['monounsaturated_fat','monounsaturated_fat_g']},
 {key:'polyunsaturated_fat',label:'Polyunsaturated fat',unit:'g',behavior:'goal',ldl:true,aliases:['polyunsaturated_fat','polyunsaturated_fat_g']},
 {key:'omega_3',label:'Omega-3',unit:'g',behavior:'goal',ldl:true,aliases:['omega_3','omega_3_g']},
 {key:'calcium',label:'Calcium',unit:'mg',behavior:'goal',ldl:false,aliases:['calcium','calcium_mg']},
 {key:'iron',label:'Iron',unit:'mg',behavior:'goal',ldl:false,aliases:['iron','iron_mg']},
 {key:'magnesium',label:'Magnesium',unit:'mg',behavior:'goal',ldl:false,aliases:['magnesium','magnesium_mg']},
 {key:'vitamin_d',label:'Vitamin D',unit:'mcg',behavior:'goal',ldl:false,aliases:['vitamin_d','vitamin_d_mcg']},
 {key:'vitamin_c',label:'Vitamin C',unit:'mg',behavior:'goal',ldl:false,aliases:['vitamin_c','vitamin_c_mg']},
 {key:'alcohol',label:'Alcohol',unit:'g',behavior:'limit',ldl:false,aliases:['alcohol','alcohol_g']},
 {key:'caffeine',label:'Caffeine',unit:'mg',behavior:'budget',ldl:false,aliases:['caffeine','caffeine_mg']}
]);
export const NUTRIENT_KEYS=Object.freeze(NUTRIENTS.map(x=>x.key));
export const NUTRIENT_BY_KEY=Object.freeze(Object.fromEntries(NUTRIENTS.map(x=>[x.key,x])));
export const CRITICAL_VISIBLE=Object.freeze(['calories','protein','saturated_fat','fiber','cholesterol','net_carbs']);
export function canonicalNutrition(input={}){const out={};for(const n of NUTRIENTS){const hit=n.aliases.find(a=>input[a]!==undefined);out[n.key]=hit?input[hit]:null;}return out}
export function scaleNutrition(input={},ratio=1){return Object.fromEntries(NUTRIENT_KEYS.map(k=>[k,input[k]==null?null:Number(input[k])*ratio]));}
