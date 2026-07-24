import {NUTRIENT_KEYS} from './nutrition/registry.js';

export const EXCHANGE_SCHEMA_VERSION=3;
export const EXCHANGE_FORMAT='fizz-health-exchange';

const nutrientWire={
 calories:'calories',protein:'protein_g',carbs:'carbohydrate_g',fiber:'fiber_g',fat:'total_fat_g',saturated_fat:'saturated_fat_g',
 trans_fat:'trans_fat_g',cholesterol:'cholesterol_mg',sodium:'sodium_mg',potassium:'potassium_mg',total_sugar:'total_sugars_g',
 added_sugar:'added_sugars_g',monounsaturated_fat:'monounsaturated_fat_g',polyunsaturated_fat:'polyunsaturated_fat_g',omega_3:'omega_3_g',
 calcium:'calcium_mg',iron:'iron_mg',magnesium:'magnesium_mg',vitamin_d:'vitamin_d_mcg',vitamin_c:'vitamin_c_mg',alcohol:'alcohol_g',caffeine:'caffeine_mg'
};
export const WIRE_TO_NUTRIENT=Object.fromEntries(Object.entries(nutrientWire).map(([k,v])=>[v,k]));
const emptyNutrition=()=>Object.fromEntries(Object.values(nutrientWire).map(k=>[k,null]));

const sharedRules=[
 'Return ONLY one valid JSON object. Do not add markdown, commentary, or code fences.',
 'Preserve format, schema_version, request_type, request_id, operation, and target exactly.',
 'Analyze all attached photographs together and use the text description when supplied.',
 'Populate only values supported by visible evidence or a reasonable visual estimate. Never invent an exact value.',
 'Unknown is null, not zero. Use numeric 0 only when the evidence explicitly supports zero.',
 'Use grams for macronutrients, milligrams for sodium/cholesterol/minerals, micrograms for vitamin D, and calories as kcal.',
 'Include overall confidence from 0 to 100 and concise evidence notes.',
 'Set evidence_quality to verified_label, manufacturer, visual_estimate, restaurant_estimate, or user_description.',
 'For visual estimates, include portion assumptions and do not describe estimated values as verified.'
];

export function buildFoodEnrichmentExchange(food={}){
 const existingNutrition=Object.fromEntries(Object.entries(nutrientWire).map(([key,wire])=>[wire,food[key]??null]));
 return {
  format:EXCHANGE_FORMAT,schema_version:EXCHANGE_SCHEMA_VERSION,request_type:'universal_exchange',request_id:`food-enrichment-${food.food_id}-${Date.now()}`,
  operation:'enrich_existing_food',target:{type:'food',id:food.food_id,create_if_missing:false},
  instructions:{recipient:'ChatGPT with access to every attached photograph',purpose:'Improve the selected existing Fizz Health food record.',rules:[...sharedRules,'This is an existing record. Never create a new food and never change target.id.','Return the complete proposed record so Fizz Health can show Current versus Proposed.','If product identity does not match the selected food, set identity_match=false and explain why.']},
  existing_record:{food_id:food.food_id,name:food.name??null,brand:food.brand??null,category:food.category??null,serving:{amount:food.default_serving??null,unit:food.unit??null,description:food.serving_description??null,servings_per_container:food.servings_per_container??null},nutrition:existingNutrition,ingredients:food.ingredients??null,allergens:food.allergens??null,barcode:food.barcode??null,package:{quantity:food.package_quantity??null,expiration_date:food.expiration_date??null,date_type:food.expiration_date_type??null,preparation_instructions:food.preparation_instructions??null},inventory_context:{quantity:food.pantry_quantity??null,unit:food.pantry_unit??null,location:food.pantry_location??null,opened:food.pantry_opened??null,purchase_date:food.pantry_purchase_date??null,expiration:food.pantry_expiration??null,notes:food.pantry_notes??null},notes:food.notes??null},
  proposed_record:{food_id:food.food_id,name:food.name??null,brand:food.brand??null,category:food.category??null,serving:{amount:null,unit:null,description:null,servings_per_container:null},nutrition:emptyNutrition(),ingredients:null,allergens:null,barcode:null,package:{quantity:null,expiration_date:null,date_type:null,preparation_instructions:null},notes:null},
  analysis:{identity_match:null,confidence:null,evidence_quality:null,evidence_notes:[],portion_assumptions:[],photos_analyzed:[]},review:{approval_mode:'all_or_nothing',user_review_required:true}
 };
}

export function buildNewFoodExchange({evidenceType='food_photo'}={}){
 return {format:EXCHANGE_FORMAT,schema_version:EXCHANGE_SCHEMA_VERSION,request_type:'universal_exchange',request_id:`new-food-${Date.now()}`,operation:'create_food',target:{type:'food',id:null,create_if_missing:true},instructions:{recipient:'ChatGPT with access to attached photos and description',purpose:'Create one reusable Fizz Health food record.',rules:[...sharedRules,'Return one proposed reusable food record.','Use package evidence when available; otherwise clearly mark nutrition as estimated.','Do not create a pantry record or consumed meal event.']},capture:{evidence_type:evidenceType},existing_record:null,proposed_record:{food_id:null,name:null,brand:null,category:null,serving:{amount:1,unit:'serving',description:null,servings_per_container:null},nutrition:emptyNutrition(),ingredients:null,allergens:null,barcode:null,package:{quantity:null,expiration_date:null,date_type:null,preparation_instructions:null},notes:null},analysis:{identity_match:true,confidence:null,evidence_quality:evidenceType==='package_photos'?'verified_label':evidenceType==='text_description'?'user_description':'visual_estimate',evidence_notes:[],portion_assumptions:[],photos_analyzed:[]},review:{approval_mode:'all_or_nothing',user_review_required:true}};
}

export function buildLogOnceExchange(){
 return {format:EXCHANGE_FORMAT,schema_version:EXCHANGE_SCHEMA_VERSION,request_type:'universal_exchange',request_id:`log-once-${Date.now()}`,operation:'log_once_meal',target:{type:'meal_event',id:null,create_if_missing:true},instructions:{recipient:'ChatGPT with access to the attached meal photograph and description',purpose:'Estimate nutrition for one consumed meal without creating a reusable food.',rules:[...sharedRules,'Return one proposed consumed meal event.','This is a one-time meal. Never create a Food, Recipe, Pantry item, or restaurant menu item.','Estimate the visible portion and include portion assumptions.','Use restaurant_estimate when the meal appears to be restaurant food; otherwise use visual_estimate.']},existing_record:null,proposed_record:{name:null,meal_type:'Meal',amount:1,unit:'serving',portion_description:null,nutrition:emptyNutrition(),notes:null},analysis:{identity_match:true,confidence:null,evidence_quality:'visual_estimate',evidence_notes:[],portion_assumptions:[],photos_analyzed:[]},review:{approval_mode:'all_or_nothing',user_review_required:true}};
}

const quoteMap={"“":'"',"”":'"',"„":'"',"‟":'"'};

function normalizeSmartQuotedJson(text=''){
 const source=String(text);let out='',inSmart=false,escaped=false;
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(ch==='“'||ch==='”'||ch==='„'||ch==='‟'){
   if(!inSmart){out+='"';inSmart=true;escaped=false}else{out+='"';inSmart=false;escaped=false}
   continue;
  }
  if(inSmart&&ch==='"'){
   out+=escaped?'"':'\\"';escaped=false;continue;
  }
  if(inSmart&&ch==='\\'){
   out+=ch;escaped=!escaped;continue;
  }
  escaped=false;out+=quoteMap[ch]||ch;
 }
 return out;
}

function removeTrailingCommas(text=''){
 let out='',inString=false,escaped=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(inString){out+=ch;if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inString=false;continue}
  if(ch==='"'){inString=true;out+=ch;continue}
  if(ch===','){
   let j=i+1;while(j<text.length&&/\s/.test(text[j]))j++;
   if(text[j]===']'||text[j]==='}')continue;
  }
  out+=ch;
 }
 return out;
}

export function normalizeExchangeJson(text=''){
 return normalizeSmartQuotedJson(String(text))
  .replace(/^\uFEFF/,'')
  .replace(/\u00a0/g,' ')
  .replace(/[‘’‚‛]/g,"'")
  .replace(/^\s*```(?:json)?\s*/i,'')
  .replace(/\s*```\s*$/,'')
  .replace(/\r\n?/g,'\n')
  .trim();
}
function jsonErrorContext(text,error){
 const match=String(error?.message||'').match(/position\s+(\d+)/i);if(!match)return error?.message||'Unknown JSON syntax error.';
 const position=Number(match[1]),before=text.slice(0,position),line=before.split('\n').length,column=position-(before.lastIndexOf('\n')+1)+1;
 const field=[...before.matchAll(/"([^"\\]+)"\s*:/g)].at(-1)?.[1];
 const excerpt=text.slice(Math.max(0,position-28),Math.min(text.length,position+28)).replace(/\s+/g,' ');
 return `${error.message}${field?` near field "${field}"`:''} (line ${line}, column ${column}). Context: ${excerpt}`;
}
export function parseExchangeJson(text=''){
 const original=String(text),normalized=normalizeExchangeJson(original);
 if(!normalized)throw new Error('Paste the JSON response first.');
 const attempts=[{text:normalized,repairs:[]}];
 const noTrailing=removeTrailingCommas(normalized);if(noTrailing!==normalized)attempts.push({text:noTrailing,repairs:['trailing commas']});
 const start=normalized.indexOf('{'),end=normalized.lastIndexOf('}');
 if(start>=0&&end>start){const extracted=normalized.slice(start,end+1),clean=removeTrailingCommas(extracted);if(!attempts.some(x=>x.text===clean))attempts.push({text:clean,repairs:['clipboard wrapping',...(clean!==extracted?['trailing commas']:[])]})}
 let lastError;
 for(const attempt of attempts){try{return {payload:normalizeStructuredJsonFields(JSON.parse(attempt.text)),normalized:attempt.text,repaired:attempt.text!==original.trim(),repairs:attempt.repairs}}catch(error){lastError=error}}
 throw new Error(`JSON syntax failed. ${jsonErrorContext(attempts.at(-1).text,lastError)}`);
}
export function normalizeStructuredJsonFields(value){
 if(Array.isArray(value))return value.map(normalizeStructuredJsonFields);
 if(!value||typeof value!=='object')return value;
 const result={};
 for(const [key,raw] of Object.entries(value)){
  let next=normalizeStructuredJsonFields(raw);
  if(key.endsWith('_json')&&typeof next==='string'){
   const trimmed=next.trim();if((trimmed.startsWith('[')&&trimmed.endsWith(']'))||(trimmed.startsWith('{')&&trimmed.endsWith('}'))){try{next=JSON.parse(trimmed)}catch{}}
  }
  result[key]=next;
 }
 return result;
}
export function serializeJsonBackedFields(record={}){
 const result={};for(const [key,value] of Object.entries(record||{}))result[key]=key.endsWith('_json')&&value!=null&&typeof value!=='string'?JSON.stringify(value):value;
 return result;
}
export function restaurantMenuItems(payload={}){
 const proposed=payload.proposed_record||payload.proposed||payload;
 const menu=proposed.menu||{};
 const direct=proposed.menu_items||proposed.items||proposed.restaurant_meals||menu.menu_items||menu.items;
 const rows=[];
 const add=(item={},sectionName=null)=>{
  const nutrition=item.nutrition||{};
  const name=item.meal_name||item.name;
  if(!name)return;
  rows.push({...item,
   meal_name:name,
   category:item.category||sectionName||null,
   serving_description:item.serving_description||item.serving||item.description||null,
   calories:item.calories??nutrition.calories??null,
   protein:item.protein??nutrition.protein_g??null,
   carbs:item.carbs??nutrition.carbohydrate_g??null,
   fiber:item.fiber??nutrition.fiber_g??null,
   fat:item.fat??nutrition.total_fat_g??null,
   saturated_fat:item.saturated_fat??nutrition.saturated_fat_g??null,
   sodium:item.sodium??nutrition.sodium_mg??null,
   price:typeof item.price==='object'?item.price?.amount??null:item.price??null
  });
 };
 if(Array.isArray(direct))direct.forEach(item=>add(item));
 if(Array.isArray(menu.sections))for(const section of menu.sections||[])for(const item of section?.items||[])add(item,section?.name||null);
 return rows;
}
export function validateRestaurantExchange(payload={},expected={}){
 if(!payload||payload.format!==EXCHANGE_FORMAT)throw new Error('Not a Fizz Health exchange response.');
 if(Number(payload.schema_version)!==EXCHANGE_SCHEMA_VERSION)throw new Error(`Expected exchange schema v${EXCHANGE_SCHEMA_VERSION}.`);
 if(payload.request_type!=='universal_exchange')throw new Error('Unsupported exchange request type.');
 if(expected.operation&&payload.operation!==expected.operation)throw new Error(`Expected ${expected.operation}, but the response is for ${payload.operation||'an unknown operation'}.`);
 if(expected.targetId&&String(payload.target?.id)!==String(expected.targetId))throw new Error('The response targets a different restaurant or menu item.');
 if(!payload.proposed_record&&!payload.proposed)throw new Error('The exchange is missing proposed_record.');
 if(['replace_menu','append_menu_items'].includes(payload.operation)&&!restaurantMenuItems(payload).length)throw new Error('No menu items were found. Use proposed_record.menu.sections or proposed_record.menu_items.');
 return payload;
}
export function validateUniversalExchange(payload){
 if(!payload||payload.format!==EXCHANGE_FORMAT)throw new Error('Not a Fizz Health exchange.');
 if(Number(payload.schema_version)!==EXCHANGE_SCHEMA_VERSION)throw new Error(`Expected exchange schema v${EXCHANGE_SCHEMA_VERSION}.`);
 if(payload.request_type!=='universal_exchange')throw new Error('Unsupported exchange request type.');
 if(!['enrich_existing_food','create_food','log_once_meal'].includes(payload.operation))throw new Error('Unsupported exchange operation.');
 if(!payload.target?.type)throw new Error('The exchange is missing its target.');
 if(payload.operation==='enrich_existing_food'&&(!payload.target.id||payload.target.create_if_missing!==false))throw new Error('Existing-food enrichment has an invalid target.');
 if(!payload.proposed_record)throw new Error('The exchange is missing proposed_record.');
 return payload;
}

export function foodProposal(payload){
 const p=payload.proposed_record||{},n=p.nutrition||{},result={};
 for(const [wire,key] of Object.entries(WIRE_TO_NUTRIENT))result[key]=n[wire]??null;
 return {...result,name:p.name??null,brand:p.brand??null,category:p.category??null,default_serving:p.serving?.amount??null,unit:p.serving?.unit??null,serving_description:p.serving?.description??null,servings_per_container:p.serving?.servings_per_container??null,ingredients:Array.isArray(p.ingredients)?p.ingredients.join(', '):p.ingredients??null,allergens:Array.isArray(p.allergens)?p.allergens.join(', '):p.allergens??null,barcode:p.barcode??null,package_quantity:p.package?.quantity??null,expiration_date:p.package?.expiration_date??null,expiration_date_type:p.package?.date_type??null,preparation_instructions:p.package?.preparation_instructions??null,notes:p.notes??null};
}
export function mealProposal(payload){const p=payload.proposed_record||{},n=p.nutrition||{},nutrition={};for(const [wire,key] of Object.entries(WIRE_TO_NUTRIENT))nutrition[key]=n[wire]??null;return {...nutrition,name:p.name??null,meal_type:p.meal_type||'Meal',amount:Number(p.amount)||1,unit:p.unit||'serving',portion_description:p.portion_description??null,notes:p.notes??null}}
export function changedFoodFields(current,payload){
 const proposed=foodProposal(payload);const fields=[];const labels={name:'Name',brand:'Brand',category:'Category',default_serving:'Serving amount',unit:'Serving unit',serving_description:'Serving description',servings_per_container:'Servings per container',ingredients:'Ingredients',allergens:'Allergens',barcode:'Barcode',package_quantity:'Package quantity',expiration_date:'Package date',expiration_date_type:'Date type',preparation_instructions:'Preparation instructions',notes:'Notes'};
 for(const key of [...Object.keys(labels),...NUTRIENT_KEYS]){const next=proposed[key];if(next===null||next===undefined||next==='')continue;const prior=current?.[key]??null;if(String(prior??'')!==String(next??''))fields.push({key,label:labels[key]||key.replaceAll('_',' '),current:prior,proposed:next})}return fields;
}
