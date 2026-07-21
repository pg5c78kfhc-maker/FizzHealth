import {NUTRIENT_KEYS} from './nutrition/registry';

export const EXCHANGE_SCHEMA_VERSION=3;
export const EXCHANGE_FORMAT='fizz-health-exchange';

const nutrientWire={
 calories:'calories',protein:'protein_g',carbs:'carbohydrate_g',fiber:'fiber_g',fat:'total_fat_g',saturated_fat:'saturated_fat_g',
 trans_fat:'trans_fat_g',cholesterol:'cholesterol_mg',sodium:'sodium_mg',potassium:'potassium_mg',total_sugar:'total_sugars_g',
 added_sugar:'added_sugars_g',monounsaturated_fat:'monounsaturated_fat_g',polyunsaturated_fat:'polyunsaturated_fat_g',omega_3:'omega_3_g',
 calcium:'calcium_mg',iron:'iron_mg',magnesium:'magnesium_mg',vitamin_d:'vitamin_d_mcg',vitamin_c:'vitamin_c_mg',alcohol:'alcohol_g',caffeine:'caffeine_mg'
};
export const WIRE_TO_NUTRIENT=Object.fromEntries(Object.entries(nutrientWire).map(([k,v])=>[v,k]));

export function buildFoodEnrichmentExchange(food={}){
 const existingNutrition=Object.fromEntries(Object.entries(nutrientWire).map(([key,wire])=>[wire,food[key]??null]));
 return {
  format:EXCHANGE_FORMAT,schema_version:EXCHANGE_SCHEMA_VERSION,request_type:'universal_exchange',request_id:`food-enrichment-${food.food_id}-${Date.now()}`,
  operation:'enrich_existing_food',
  target:{type:'food',id:food.food_id,create_if_missing:false},
  instructions:{
   recipient:'ChatGPT with access to every attached product photograph',
   purpose:'Enrich the selected existing Fizz Health food record from all visible package evidence.',
   rules:[
    'Return ONLY one valid JSON object. Do not add markdown, commentary, or code fences.',
    'Preserve format, schema_version, request_type, request_id, operation, and target exactly.',
    'This is an existing record. Never create a new food and never change target.id.',
    'Analyze all attached photographs together. They may show the package front, product name, brand, Nutrition Facts, ingredients, allergens, barcode, package quantity, preparation instructions, and expiration/best-by/use-by/sell-by dates.',
    'Populate only values supported by visible evidence. Never invent a value.',
    'Unknown is null, not zero. Use numeric 0 only when the source explicitly shows zero.',
    'Existing values may be corrected when newer visible package evidence differs. Return the complete proposed record so Fizz Health can show Current versus Proposed.',
    'Use grams for macronutrients, milligrams for sodium/cholesterol/minerals, micrograms for vitamin D, and calories as kcal.',
    'For every populated or changed field, add concise evidence notes. Include an overall confidence from 0 to 100.',
    'If product identity does not match the selected existing food, set identity_match=false and explain why.'
   ]
  },
  existing_record:{
   food_id:food.food_id,name:food.name??null,brand:food.brand??null,category:food.category??null,
   serving:{amount:food.default_serving??null,unit:food.unit??null,description:food.serving_description??null,servings_per_container:food.servings_per_container??null},
   nutrition:existingNutrition,ingredients:food.ingredients??null,allergens:food.allergens??null,barcode:food.barcode??null,
   package:{quantity:food.package_quantity??null,expiration_date:food.expiration_date??null,date_type:food.expiration_date_type??null,preparation_instructions:food.preparation_instructions??null},notes:food.notes??null
  },
  proposed_record:{food_id:food.food_id,name:food.name??null,brand:food.brand??null,category:food.category??null,serving:{amount:null,unit:null,description:null,servings_per_container:null},nutrition:Object.fromEntries(Object.values(nutrientWire).map(k=>[k,null])),ingredients:null,allergens:null,barcode:null,package:{quantity:null,expiration_date:null,date_type:null,preparation_instructions:null},notes:null},
  analysis:{identity_match:null,confidence:null,evidence_notes:[],photos_analyzed:[]},
  review:{approval_mode:'all_or_nothing',user_review_required:true}
 };
}

export function normalizeExchangeJson(text=''){return String(text).replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim()}
export function validateUniversalExchange(payload){
 if(!payload||payload.format!==EXCHANGE_FORMAT)throw new Error('Not a Fizz Health exchange.');
 if(Number(payload.schema_version)!==EXCHANGE_SCHEMA_VERSION)throw new Error(`Expected exchange schema v${EXCHANGE_SCHEMA_VERSION}.`);
 if(payload.request_type!=='universal_exchange')throw new Error('Unsupported exchange request type.');
 if(payload.operation!=='enrich_existing_food')throw new Error('This release supports existing-food enrichment imports.');
 if(payload.target?.type!=='food'||!payload.target?.id)throw new Error('The exchange is missing its food target.');
 if(payload.target.create_if_missing!==false)throw new Error('Existing-food enrichment must set create_if_missing to false.');
 if(!payload.proposed_record)throw new Error('The exchange is missing proposed_record.');
 return payload;
}

export function foodProposal(payload){
 const p=payload.proposed_record||{},n=p.nutrition||{},result={};
 for(const [wire,key] of Object.entries(WIRE_TO_NUTRIENT))result[key]=n[wire]??null;
 return {...result,name:p.name??null,brand:p.brand??null,category:p.category??null,default_serving:p.serving?.amount??null,unit:p.serving?.unit??null,serving_description:p.serving?.description??null,servings_per_container:p.serving?.servings_per_container??null,ingredients:Array.isArray(p.ingredients)?p.ingredients.join(', '):p.ingredients??null,allergens:Array.isArray(p.allergens)?p.allergens.join(', '):p.allergens??null,barcode:p.barcode??null,package_quantity:p.package?.quantity??null,expiration_date:p.package?.expiration_date??null,expiration_date_type:p.package?.date_type??null,preparation_instructions:p.package?.preparation_instructions??null,notes:p.notes??null};
}

export function changedFoodFields(current,payload){
 const proposed=foodProposal(payload);const fields=[];
 const labels={name:'Name',brand:'Brand',category:'Category',default_serving:'Serving amount',unit:'Serving unit',serving_description:'Serving description',servings_per_container:'Servings per container',ingredients:'Ingredients',allergens:'Allergens',barcode:'Barcode',package_quantity:'Package quantity',expiration_date:'Package date',expiration_date_type:'Date type',preparation_instructions:'Preparation instructions',notes:'Notes'};
 for(const key of [...Object.keys(labels),...NUTRIENT_KEYS]){
  const next=proposed[key];if(next===null||next===undefined||next==='')continue;const prior=current?.[key]??null;
  if(String(prior??'')!==String(next??''))fields.push({key,label:labels[key]||key.replaceAll('_',' '),current:prior,proposed:next});
 }
 return fields;
}
