import * as XLSX from 'xlsx';
import {prepareWorkbookImport,transaction,recordImportFailure} from './database';
const clean=v=>v==null?'':String(v).trim();
const num=v=>{if(v==null||String(v).trim()==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n:null};
const localDateKey=(date=new Date())=>{const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`};
const excelDate=v=>{
  if(v==null||v==='') return '';
  if(typeof v==='number'){const d=new Date(Date.UTC(1899,11,30)+v*86400000);return d.toISOString().slice(0,10)}
  const d=new Date(v);return Number.isNaN(d.getTime())?clean(v):d.toISOString().slice(0,10);
};
const rowVal=(row,...names)=>{for(const n of names) if(Object.prototype.hasOwnProperty.call(row,n)) return row[n];return ''};
const rowsFor=(wb,name)=>wb.Sheets[name]?XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:null,raw:true}):[];

const dateTimeAtNoon=value=>{const d=excelDate(value);return d?`${d}T12:00:00.000Z`:''};
const unitFromNotes=value=>{const text=clean(value);const match=text.match(/\b(mg\/dL|ng\/mL|mmol\/L|%|mg|g|lb|in|steps|bpm|mmHg)\b/i);return match?match[1]:''};
const numericRows=rows=>rows.filter(row=>Object.values(row).some(value=>value!==null&&clean(value)!==''));
const COVERAGE_SHEETS={
  'Foods':'foods','Food Nutrition':'foods','Pantry Inventory':'pantry','Recipes':'recipes','Meal Log':'meals','Restaurant Guide':'restaurants',
  'Body Metrics':'health_metrics','Daily Activity':'health_metrics','Lab Results':'lab_results','Workout Sessions':'workout_sessions',
  'Workout Sets':'workout_sets','Health Targets':'health_goals/settings','Health Context':'health_context_entries','Sleep Daily':'sleep_daily'
};


const bindValues=(columns,values)=>{
  const safe=values.map(value=>value===undefined?null:value);
  const invalid=safe.findIndex(value=>value!==null&&!['string','number'].includes(typeof value));
  if(invalid>=0)throw new Error(`Column ${columns[invalid]} has unsupported value ${String(safe[invalid])}`);
  return safe;
};


function nutritionFromNotes(notes,serving){
  const text=clean(notes);
  if(!text)return null;
  const m=text.match(/([0-9.]+)\s*kcal\s*,?\s*([0-9.]+)\s*P\s*,?\s*([0-9.]+)\s*C\s*,?\s*([0-9.]+)\s*F/i);
  if(!m)return null;
  return {calories:num(m[1]),protein:num(m[2]),carbs:num(m[3]),fat:num(m[4]),fiber:null,saturated_fat:null,serving};
}

const hasUsableNutrition=values=>['calories','protein','carbs','fiber','fat'].some(key=>Number(values?.[key])>0);
const normalizedFoodName=value=>clean(value).toLowerCase()
  .replace(/^365\s+/,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();


const normalizeHeader=value=>clean(value).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const SHEET_MAPS={
  foods:{sheet:'Foods',required:['food_id','name'],fields:{
    food_id:['Food ID'],name:['Food','Food Name','Name'],category:['Category'],default_serving:['Default Serving'],unit:['Unit'],
    calories:['Calories'],protein:['Protein (g)'],carbs:['Carbs (g)','Total Carbs (g)'],fiber:['Fiber (g)'],fat:['Fat (g)','Total Fat (g)'],
    saturated_fat:['Sat Fat (g)','Saturated Fat (g)'],sodium:['Sodium (mg)'],potassium:['Potassium (mg)'],notes:['Notes']
  }},
  pantry:{sheet:'Pantry Inventory',required:['item'],fields:{
    pantry_id:['Pantry ID'],item:['Item','Food','Name'],food_id:['Canonical Food ID','Food ID'],brand:['Brand'],on_hand:['On Hand'],quantity:['Quantity'],unit:['Unit'],
    opened:['Opened?','Opened'],opened_date:['Opened Date'],expiration:['Effective Expiry','Best By / Expiration'],location:['Location'],status:['Status'],priority:['Priority'],category:['Category'],notes:['Notes']
  }},
  meals:{sheet:'Meal Log',required:['date','food_name','amount'],fields:{
    meal_id:['Meal ID'],date:['Date','Consumed At','Timestamp'],meal_type:['Meal','Meal Type'],food_name:['Food/Recipe','Food','Food Name','Name'],amount:['Amount','Quantity'],unit:['Unit'],notes:['Notes'],reference_type:['Reference Type'],reference_id:['Reference ID'],resolution_status:['Resolution Status']
  }},
  recipes:{sheet:'Recipes',required:['recipe_name','ingredient_name'],fields:{
    recipe_id:['Recipe ID'],recipe_name:['Recipe','Recipe Name','Name'],ingredient_name:['Ingredient','Ingredient Name'],amount:['Amount'],unit:['Unit'],
    ingredient_type:['Ingredient Type'],ingredient_id:['Ingredient ID'],inventory_status:['Inventory Status']
  }}
};
function buildMapper(rows,spec={}){
  const required=Array.isArray(spec.required)?spec.required:[];
  const fields=spec.fields&&typeof spec.fields==='object'?spec.fields:{};
  const headers=new Map();
  for(const row of rows.slice(0,25))for(const key of Object.keys(row))headers.set(normalizeHeader(key),key);
  const resolved={};
  for(const [field,aliases] of Object.entries(fields)){
    const match=aliases.map(normalizeHeader).find(a=>headers.has(a));
    if(match)resolved[field]=headers.get(match);
  }
  const missing=required.filter(field=>!resolved[field]);
  return {resolved,missing,unmapped:[...headers.values()].filter(h=>!Object.values(resolved).includes(h))};
}
function mapped(row,map,field){const header=map.resolved[field];return header?row[header]:''}
function validateRequired(rows,map,spec={}){
  const required=Array.isArray(spec.required)?spec.required:[];
  const invalid=[];
  rows.forEach((row,index)=>{const missing=required.filter(f=>!clean(mapped(row,map,f)));if(missing.length)invalid.push({row:index+2,missing})});
  return invalid;
}

export async function importWorkbook(file){
  const started=performance.now();
  let stage='Preparing database schema';
  let sheet='';
  let rowNumber=null;
  const fail=(error)=>{
    const detail=error instanceof Error?error.message:String(error||'Unknown error');
    const location=[sheet,rowNumber?`row ${rowNumber}`:''].filter(Boolean).join(', ');
    throw new Error(`${stage}${location?` (${location})`:''}: ${detail}`);
  };
  try{
    const schemaReport=await prepareWorkbookImport();
    if(!file) throw new Error('No workbook was selected.');
    if(!/\.xlsx$/i.test(file.name||'')) throw new Error('Please select the Fizz Health.xlsx workbook.');
    stage='Reading workbook';
    const buffer=await file.arrayBuffer();
    if(!buffer.byteLength) throw new Error('The selected workbook is empty.');
    const wb=XLSX.read(buffer,{type:'array',cellDates:false});
    const foods=rowsFor(wb,'Foods');
    const nutrition=rowsFor(wb,'Food Nutrition');
    const pantry=rowsFor(wb,'Pantry Inventory');
    const recipes=rowsFor(wb,'Recipes');
    const mealLog=rowsFor(wb,'Meal Log');
    const restaurantGuide=rowsFor(wb,'Restaurant Guide');
    const bodyMetrics=rowsFor(wb,'Body Metrics');
    const dailyActivity=rowsFor(wb,'Daily Activity');
    const labResults=rowsFor(wb,'Lab Results');
    const workoutSessions=rowsFor(wb,'Workout Sessions');
    const workoutSets=rowsFor(wb,'Workout Sets');
    const healthTargets=rowsFor(wb,'Health Targets');
    const healthContext=rowsFor(wb,'Health Context');
    const sleepDaily=rowsFor(wb,'Sleep Daily');
    if(!wb.Sheets['Foods']||!wb.Sheets['Pantry Inventory']) throw new Error('Workbook must contain Foods and Pantry Inventory sheets.');

    stage='Mapping workbook columns';
    const maps={foods:buildMapper(foods,SHEET_MAPS.foods),pantry:buildMapper(pantry,SHEET_MAPS.pantry),recipes:buildMapper(recipes,SHEET_MAPS.recipes),meals:buildMapper(mealLog,SHEET_MAPS.meals)};
    for(const [name,map] of Object.entries(maps)){
      if(name==='recipes'&&!wb.Sheets['Recipes'])continue;
      if(name==='meals'&&!wb.Sheets['Meal Log'])continue;
      if(map.missing.length)throw new Error(`${SHEET_MAPS[name].sheet}: missing required column${map.missing.length>1?'s':''}: ${map.missing.join(', ')}`);
    }
    const validFoods=foods.filter(r=>clean(mapped(r,maps.foods,'food_id'))||clean(mapped(r,maps.foods,'name')));
    const validPantry=pantry.filter(r=>clean(mapped(r,maps.pantry,'item')));
    // Recipe sheets often contain separators, headings, or summary rows. Import only complete ingredient rows.
    const recipeCandidates=recipes.filter(r=>clean(mapped(r,maps.recipes,'recipe_name'))||clean(mapped(r,maps.recipes,'ingredient_name')));
    const validRecipes=recipeCandidates.filter(r=>clean(mapped(r,maps.recipes,'recipe_name'))&&clean(mapped(r,maps.recipes,'ingredient_name')));
    const validMeals=mealLog.filter(r=>clean(mapped(r,maps.meals,'date'))&&clean(mapped(r,maps.meals,'food_name'))&&num(mapped(r,maps.meals,'amount'))!=null);
    const skippedRecipeRows=recipeCandidates.length-validRecipes.length;
    if(!validFoods.length)throw new Error('Foods sheet contains no importable food rows.');
    if(!validPantry.length)throw new Error('Pantry Inventory sheet contains no importable pantry rows.');

    const idKey=v=>clean(v).toUpperCase();
    const nutritionMap=nutrition.length?buildMapper(nutrition,{fields:{
      food_id:['Food ID','Canonical Food ID'],serving:['Serving Quantity','Serving Size','Default Serving'],unit:['Serving Unit','Unit'],
      calories:['Calories'],protein:['Protein (g)','Protein'],carbs:['Total Carbs (g)','Carbs (g)','Carbohydrates (g)'],fiber:['Fiber (g)','Dietary Fiber (g)'],
      fat:['Total Fat (g)','Fat (g)'],saturated_fat:['Saturated Fat (g)','Sat Fat (g)'],sodium:['Sodium (mg)'],potassium:['Potassium (mg)']
    } }):{resolved:{},missing:[],unmapped:[]};
    const nval=(r,field)=>{const h=nutritionMap.resolved[field];return h?r[h]:''};
    const nutritionById=new Map(nutrition.map(r=>[idKey(nval(r,'food_id')||rowVal(r,'Food ID','Canonical Food ID')),r]).filter(([id])=>id));
    const foodIds=new Set(validFoods.map(r=>idKey(mapped(r,maps.foods,'food_id'))).filter(Boolean));
    let importedFoods=0,importedPantry=0,importedRecipes=0,importedMeals=0,importedRestaurants=0,importedHealthMetrics=0,importedLabs=0,importedWorkoutSessions=0,importedWorkoutSets=0,importedGoals=0,importedContext=0,importedSleep=0,warnings=skippedRecipeRows,repairedPantryLinks=0;
    const coverage=[];
    const coverageRow=(sheetName,status,sourceRows,importedRows,destination,details='')=>coverage.push({sheetName,status,sourceRows,importedRows,skippedRows:Math.max(0,sourceRows-importedRows),destination,details});
    let unresolvedPantry=[];

    stage='Importing workbook';
    await transaction(async db=>{
      // The transaction backup preserves the prior working database if any stage fails.
      db.run('DELETE FROM foods');
      db.run('DELETE FROM pantry');
      db.run('DELETE FROM recipes');
      if(wb.Sheets['Restaurant Guide'])db.run('DELETE FROM restaurants');

      sheet='Foods';
      for(let i=0;i<validFoods.length;i++){
        rowNumber=i+2;
        const r=validFoods[i];
        const id=clean(mapped(r,maps.foods,'food_id'));
        const name=clean(mapped(r,maps.foods,'name'));
        if(!id||!name){warnings++;continue}
        const n=nutritionById.get(idKey(id))||{};
        const serving=num(nval(n,'serving'))??num(mapped(r,maps.foods,'default_serving'));
        const unit=clean(nval(n,'unit'))||clean(mapped(r,maps.foods,'unit'));
        const noteText=clean(mapped(r,maps.foods,'notes'));
        const noteNutrition=nutritionFromNotes(noteText,serving);
        const values={
          calories:num(nval(n,'calories'))??num(mapped(r,maps.foods,'calories'))??noteNutrition?.calories,
          protein:num(nval(n,'protein'))??num(mapped(r,maps.foods,'protein'))??noteNutrition?.protein,
          carbs:num(nval(n,'carbs'))??num(mapped(r,maps.foods,'carbs'))??noteNutrition?.carbs,
          fiber:num(nval(n,'fiber'))??num(mapped(r,maps.foods,'fiber'))??noteNutrition?.fiber,
          fat:num(nval(n,'fat'))??num(mapped(r,maps.foods,'fat'))??noteNutrition?.fat,
          saturated_fat:num(nval(n,'saturated_fat'))??num(mapped(r,maps.foods,'saturated_fat'))??noteNutrition?.saturated_fat,
          sodium:num(nval(n,'sodium'))??num(mapped(r,maps.foods,'sodium')),
          potassium:num(nval(n,'potassium'))??num(mapped(r,maps.foods,'potassium'))
        };
        const nutritionKnown=hasUsableNutrition(values)?1:0;
        const foodColumns=['food_id','name','category','default_serving','unit','calories','protein','carbs','fiber','fat','saturated_fat','sodium','potassium','notes','nutrition_known'];
        db.run(`INSERT OR REPLACE INTO foods(${foodColumns.join(',')}) VALUES (${foodColumns.map(()=>'?').join(',')})`,bindValues(foodColumns,[
          id,name,clean(mapped(r,maps.foods,'category')),serving??1,unit||'serving',values.calories,values.protein,values.carbs,values.fiber,values.fat,values.saturated_fat,values.sodium,values.potassium,noteText,nutritionKnown
        ]));
        importedFoods++;
      }

      sheet='Pantry Inventory';
      for(let i=0;i<validPantry.length;i++){
        rowNumber=i+2;
        const r=validPantry[i];
        const item=clean(mapped(r,maps.pantry,'item'));
        const foodId=clean(mapped(r,maps.pantry,'food_id'));
        if(foodId&&!foodIds.has(idKey(foodId)))warnings++;
        const pantryColumns=['pantry_id','item','food_id','brand','on_hand','quantity','unit','opened','opened_date','expiration','location','status','priority','category','notes'];
        db.run(`INSERT INTO pantry(${pantryColumns.join(',')}) VALUES (${pantryColumns.map(()=>'?').join(',')})`,bindValues(pantryColumns,[
          clean(mapped(r,maps.pantry,'pantry_id')),item,foodId,clean(mapped(r,maps.pantry,'brand')),clean(mapped(r,maps.pantry,'on_hand')),num(mapped(r,maps.pantry,'quantity')),clean(mapped(r,maps.pantry,'unit')),
          clean(mapped(r,maps.pantry,'opened')),excelDate(mapped(r,maps.pantry,'opened_date')),excelDate(mapped(r,maps.pantry,'expiration')),clean(mapped(r,maps.pantry,'location')),
          clean(mapped(r,maps.pantry,'status')),clean(mapped(r,maps.pantry,'priority')),clean(mapped(r,maps.pantry,'category')),clean(mapped(r,maps.pantry,'notes'))
        ]));
        importedPantry++;
      }

      sheet='Recipes';
      for(let i=0;i<validRecipes.length;i++){
        rowNumber=i+2;
        const r=validRecipes[i];
        const recipeName=clean(mapped(r,maps.recipes,'recipe_name'));
        const ingredient=clean(mapped(r,maps.recipes,'ingredient_name'));
        const ingredientId=clean(mapped(r,maps.recipes,'ingredient_id'));
        if(ingredientId&&clean(mapped(r,maps.recipes,'ingredient_type')).toLowerCase()==='food'&&!foodIds.has(idKey(ingredientId)))warnings++;
        const recipeColumns=['recipe_id','recipe_name','ingredient_name','amount','unit','ingredient_type','ingredient_id','inventory_status'];
        db.run(`INSERT INTO recipes(${recipeColumns.join(',')}) VALUES (${recipeColumns.map(()=>'?').join(',')})`,bindValues(recipeColumns,[
          clean(mapped(r,maps.recipes,'recipe_id')),recipeName,ingredient,num(mapped(r,maps.recipes,'amount')),clean(mapped(r,maps.recipes,'unit')),clean(mapped(r,maps.recipes,'ingredient_type')),ingredientId,clean(mapped(r,maps.recipes,'inventory_status'))
        ]));
        importedRecipes++;
      }


      if(wb.Sheets['Restaurant Guide']){
        sheet='Restaurant Guide';
        for(let i=0;i<restaurantGuide.length;i++){
          rowNumber=i+2;
          const r=restaurantGuide[i];
          const name=clean(rowVal(r,'Restaurant'));
          if(!name)continue;
          const restaurantId=clean(rowVal(r,'Restaurant ID'))||`REST-${String(i+1).padStart(4,'0')}`;
          const cols=['restaurant_id','name','location','status','best_choices','occasional_treats','avoid_limit','notes','updated_at'];
          db.run(`INSERT OR REPLACE INTO restaurants(${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`,bindValues(cols,[
            restaurantId,name,clean(rowVal(r,'Location')),clean(rowVal(r,'Status')),clean(rowVal(r,'Best Choices')),
            clean(rowVal(r,'Occasional Treats')),clean(rowVal(r,'Avoid / Limit')),clean(rowVal(r,'Notes')),new Date().toISOString()
          ]));
          importedRestaurants++;
        }
      }

      const foodRowsForMeals=db.query('SELECT * FROM foods');
      const foodsByIdForMeals=new Map(foodRowsForMeals.map(food=>[idKey(food.food_id),food]));
      sheet='Meal Log';
      for(let i=0;i<validMeals.length;i++){
        rowNumber=i+2;
        const r=validMeals[i];
        const rawDate=mapped(r,maps.meals,'date');
        let consumed;
        if(typeof rawDate==='number') consumed=new Date(Date.UTC(1899,11,30)+rawDate*86400000+12*3600000);
        else { consumed=new Date(rawDate); if(!Number.isNaN(consumed.getTime())&&consumed.getHours()===0&&consumed.getMinutes()===0) consumed.setHours(12,0,0,0); }
        if(Number.isNaN(consumed?.getTime?.())){warnings++;continue}
        const foodName=clean(mapped(r,maps.meals,'food_name'));
        const referenceType=clean(mapped(r,maps.meals,'reference_type'));
        const referenceId=clean(mapped(r,maps.meals,'reference_id'));
        const mealId=clean(mapped(r,maps.meals,'meal_id'));
        const sourceRecordId=`${mealId||localDateKey(consumed)}:${i+2}:${referenceType}:${referenceId}:${foodName}`;
        const food=referenceType.toLowerCase()==='food'&&referenceId?foodsByIdForMeals.get(idKey(referenceId)):foodRowsForMeals.find(f=>normalizedFoodName(f.name)===normalizedFoodName(foodName));
        const amount=num(mapped(r,maps.meals,'amount'))??1;
        const unit=clean(mapped(r,maps.meals,'unit'))||food?.unit||'serving';
        const serving=Number(food?.default_serving)||1;
        const ratio=food?amount/serving:0;
        const known=food&&hasUsableNutrition(food)?1:0;
        const cols=['eaten_at','created_at','updated_at','consumed_local_date','timezone_offset_minutes','meal_type','food_id','food_name','amount','unit','calories','protein','carbs','fiber','fat','saturated_fat','notes','nutrition_known','source','source_record_id'];
        db.run(`INSERT OR REPLACE INTO meals(${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`,bindValues(cols,[
          consumed.toISOString(),new Date().toISOString(),new Date().toISOString(),excelDate(rawDate),0,clean(mapped(r,maps.meals,'meal_type'))||'Meal',food?.food_id||referenceId||null,foodName,amount,unit,
          food?(Number(food.calories)||0)*ratio:0,food?(Number(food.protein)||0)*ratio:0,food?(Number(food.carbs)||0)*ratio:0,food?(Number(food.fiber)||0)*ratio:0,food?(Number(food.fat)||0)*ratio:0,food?(Number(food.saturated_fat)||0)*ratio:0,
          clean(mapped(r,maps.meals,'notes'))||(!String(rawDate).includes('T')?'Historical import time unavailable; displayed at noon.':''),known,'workbook',sourceRecordId
        ]));
        importedMeals++;
      }


      // FH-1220: import the legacy health history into first-class application tables.
      const now=new Date().toISOString();
      db.run("DELETE FROM health_metrics WHERE source='workbook'");
      db.run("DELETE FROM lab_results WHERE source='workbook'");
      db.run("DELETE FROM workout_sets WHERE source='workbook'");
      db.run("DELETE FROM workout_sessions WHERE source='workbook'");
      db.run("DELETE FROM sleep_daily WHERE source='workbook'");
      db.run("DELETE FROM health_context_entries WHERE source='workbook'");

      sheet='Body Metrics';
      for(let i=0;i<bodyMetrics.length;i++){
        rowNumber=i+2;const r=bodyMetrics[i];const date=excelDate(rowVal(r,'Date'));if(!date)continue;
        const notes=clean(rowVal(r,'Notes'));const at=`${date}T12:00:00.000Z`;
        const insertMetric=(type,primary,secondary,unit,suffix)=>{if(primary==null)return;const sourceId=`body:${date}:${suffix}`;db.run(`INSERT OR REPLACE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[type,primary,secondary,unit,at,date,notes||null,'workbook',now,now,sourceId]);importedHealthMetrics++};
        insertMetric('weight',num(rowVal(r,'Weight (lb)')),null,'lb','weight');
        insertMetric('waist',num(rowVal(r,'Waist (in)')),null,'in','waist');
        insertMetric('blood_pressure',num(rowVal(r,'Systolic BP')),num(rowVal(r,'Diastolic BP')),'mmHg','bp');
        insertMetric('resting_heart_rate',num(rowVal(r,'Resting HR')),null,'bpm','rhr');
      }
      coverageRow('Body Metrics',bodyMetrics.length?'imported':'not_present',bodyMetrics.length,importedHealthMetrics,'health_metrics','Weight, waist, blood pressure, and resting heart rate.');

      sheet='Daily Activity';let activityImported=0;
      for(let i=0;i<dailyActivity.length;i++){
        rowNumber=i+2;const r=dailyActivity[i];const date=excelDate(rowVal(r,'Date'));if(!date)continue;const notes=clean(rowVal(r,'Notes'));const at=`${date}T12:00:00.000Z`;
        for(const [type,header,unit] of [['steps','Steps','steps'],['cardio_minutes','Cardio Minutes','min'],['distance','Distance','mi'],['active_calories','Active Calories','kcal']]){const value=num(rowVal(r,header));if(value==null)continue;db.run(`INSERT OR REPLACE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[type,value,null,unit,at,date,notes||null,'workbook',now,now,`activity:${date}:${type}`]);activityImported++;importedHealthMetrics++}
      }
      coverageRow('Daily Activity',dailyActivity.length?'imported':'not_present',dailyActivity.length,activityImported,'health_metrics','Steps, cardio minutes, distance, and active calories.');

      sheet='Lab Results';
      for(let i=0;i<labResults.length;i++){
        rowNumber=i+2;const r=labResults[i];const date=excelDate(rowVal(r,'Date'));const biomarker=clean(rowVal(r,'Test'));const value=num(rowVal(r,'Value'));if(!date||!biomarker||value==null)continue;const notes=clean(rowVal(r,'Notes'));const unit=unitFromNotes(notes),collected=`${date}T12:00:00.000Z`,normalized=normalizedFoodName(biomarker);db.run(`INSERT OR REPLACE INTO lab_results(biomarker,value,unit,reference_low,reference_high,collected_at,source,notes,created_at,source_record_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,[biomarker,value,unit,null,null,collected,'workbook',notes||null,now,`lab:${date}:${normalized}`]);db.run(`INSERT OR REPLACE INTO health_metrics(metric_type,value_primary,value_secondary,unit,measured_at,local_date,notes,source,created_at,updated_at,source_record_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[`biomarker:${normalized}`,value,null,unit,collected,date,notes||null,'workbook',now,now,`lab-metric:${date}:${normalized}`]);importedLabs++;
      }
      coverageRow('Lab Results',labResults.length?'imported':'not_present',labResults.length,importedLabs,'lab_results','Numeric biomarkers imported; nonnumeric fasting-status rows are retained in coverage but skipped.');

      sheet='Workout Sessions';
      for(let i=0;i<workoutSessions.length;i++){
        rowNumber=i+2;const r=workoutSessions[i];const id=clean(rowVal(r,'Session ID'));const date=excelDate(rowVal(r,'Date'));if(!id||!date)continue;db.run(`INSERT OR REPLACE INTO workout_sessions(session_id,local_date,workout,program,duration_minutes,location,source,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,[id,date,clean(rowVal(r,'Workout')),clean(rowVal(r,'Program')),num(rowVal(r,'Duration (min)')),clean(rowVal(r,'Location')),'workbook',clean(rowVal(r,'Notes'))||clean(rowVal(r,'Source')),now,now]);importedWorkoutSessions++;
      }
      coverageRow('Workout Sessions',workoutSessions.length?'imported':'not_present',workoutSessions.length,importedWorkoutSessions,'workout_sessions');

      sheet='Workout Sets';
      for(let i=0;i<workoutSets.length;i++){
        rowNumber=i+2;const r=workoutSets[i];const id=clean(rowVal(r,'Set ID'));const sessionId=clean(rowVal(r,'Session ID'));const exercise=clean(rowVal(r,'Exercise'));if(!id||!sessionId||!exercise)continue;db.run(`INSERT OR REPLACE INTO workout_sets(set_id,session_id,exercise,set_number,load_lb,reps,rir,tempo,notes,source,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[id,sessionId,exercise,num(rowVal(r,'Set Number')),num(rowVal(r,'Load (lb)')),num(rowVal(r,'Reps')),num(rowVal(r,'RIR')),clean(rowVal(r,'Tempo')),clean(rowVal(r,'Notes'))||null,'workbook',now]);importedWorkoutSets++;
      }
      coverageRow('Workout Sets',workoutSets.length?'imported':'not_present',workoutSets.length,importedWorkoutSets,'workout_sets');

      sheet='Health Targets';
      for(let i=0;i<healthTargets.length;i++){
        rowNumber=i+2;const r=healthTargets[i];const metric=clean(rowVal(r,'Metric'));if(!metric)continue;const key=normalizedFoodName(metric).replace(/ /g,'_');const target=num(rowVal(r,'Target'));const maximum=num(rowVal(r,'Maximum'));const notes=clean(rowVal(r,'Notes'));db.run('INSERT OR REPLACE INTO settings(key,value) VALUES (?,?)',[`workbook_target_${key}`,JSON.stringify({target,maximum,goalType:clean(rowVal(r,'Goal Type')),unit:clean(rowVal(r,'Unit')),effectiveDate:excelDate(rowVal(r,'Effective Date')),notes})]);if(target!=null){db.run(`INSERT OR REPLACE INTO health_goals(goal_id,goal_type,target_value,unit,direction,target_date,priority,active,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[`workbook-${key}`,key,target,clean(rowVal(r,'Unit')),'down',null,50,1,notes||null,now,now]);}importedGoals++;
      }
      coverageRow('Health Targets',healthTargets.length?'imported':'not_present',healthTargets.length,importedGoals,'health_goals/settings','Targets and maximums preserved; numeric targets create active goals.');

      sheet='Health Context';
      for(let i=0;i<healthContext.length;i++){
        rowNumber=i+2;const r=healthContext[i];const category=clean(rowVal(r,'Category'));const key=clean(rowVal(r,'Key'));if(!category||!key)continue;const id=`context:${normalizedFoodName(category)}:${normalizedFoodName(key)}`;db.run(`INSERT OR REPLACE INTO health_context_entries(context_id,category,context_key,context_value,notes,source,updated_at) VALUES (?,?,?,?,?,?,?)`,[id,category,key,clean(rowVal(r,'Value')),clean(rowVal(r,'Notes'))||null,'workbook',now]);importedContext++;
      }
      coverageRow('Health Context',healthContext.length?'imported':'not_present',healthContext.length,importedContext,'health_context_entries');

      sheet='Sleep Daily';
      for(let i=0;i<sleepDaily.length;i++){
        rowNumber=i+2;const r=sleepDaily[i];const id=clean(rowVal(r,'Sleep ID'));const date=excelDate(rowVal(r,'Sleep Date'));if(!id||!date)continue;db.run(`INSERT OR REPLACE INTO sleep_daily(sleep_id,sleep_date,bedtime,wake_time,time_in_bed_minutes,time_asleep_minutes,awake_minutes,rem_minutes,core_minutes,deep_minutes,sleep_efficiency,sleep_score,wake_ups,source,confidence,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[id,date,clean(rowVal(r,'Bedtime')),clean(rowVal(r,'Wake Time')),num(rowVal(r,'Time in Bed (min)')),num(rowVal(r,'Time Asleep (min)')),num(rowVal(r,'Awake (min)')),num(rowVal(r,'REM (min)')),num(rowVal(r,'Core (min)')),num(rowVal(r,'Deep (min)')),num(rowVal(r,'Sleep Efficiency')),num(rowVal(r,'Sleep Score')),num(rowVal(r,'Wake-ups')),clean(rowVal(r,'Source'))||'workbook',clean(rowVal(r,'Confidence')),clean(rowVal(r,'Notes'))||null,now,now]);importedSleep++;
      }
      coverageRow('Sleep Daily',sleepDaily.length?'imported':'not_present',sleepDaily.length,importedSleep,'sleep_daily');

      // Account for every workbook sheet. Derived/report-only sheets are explicitly documented rather than silently ignored.
      const importedNames=new Set(Object.keys(COVERAGE_SHEETS));
      for(const sheetName of wb.SheetNames){if(importedNames.has(sheetName))continue;const rows=numericRows(rowsFor(wb,sheetName));coverageRow(sheetName,rows.length?'derived_or_not_supported':'empty',rows.length,0,'','Sheet is derived, presentation-only, staging, or not yet a first-class application domain. Source data is preserved in the workbook and not silently represented as imported.');}
      const importedAt=new Date().toISOString();
      db.run('DELETE FROM workbook_import_coverage');
      for(const item of coverage)db.run(`INSERT INTO workbook_import_coverage(imported_at,file_name,sheet_name,status,source_rows,imported_rows,skipped_rows,destination,details) VALUES (?,?,?,?,?,?,?,?,?)`,[importedAt,file.name,item.sheetName,item.status,item.sourceRows,item.importedRows,item.skippedRows,item.destination||null,item.details||null]);

      // Repair Pantry -> Food links when a workbook ID points to a zero-nutrition or missing food.
      // Prefer a normalized item/name match with a verified nutrition profile.
      sheet='Pantry Inventory';rowNumber=null;
      const pantryRows=db.query('SELECT id,item,food_id FROM pantry');
      const foodRows=db.query('SELECT food_id,name,calories,protein,carbs,fiber,fat,nutrition_known FROM foods');
      const foodsById=new Map(foodRows.map(food=>[idKey(food.food_id),food]));
      const foodsByName=new Map();
      for(const food of foodRows){
        const key=normalizedFoodName(food.name);
        if(!key)continue;
        const existing=foodsByName.get(key);
        const score=Number(food.nutrition_known)===1?2:hasUsableNutrition(food)?1:0;
        const oldScore=existing?(Number(existing.nutrition_known)===1?2:hasUsableNutrition(existing)?1:0):-1;
        if(score>oldScore)foodsByName.set(key,food);
      }
      repairedPantryLinks=0;
      unresolvedPantry=[];
      for(const pantryRow of pantryRows){
        const linked=foodsById.get(idKey(pantryRow.food_id));
        if(linked&&hasUsableNutrition(linked))continue;
        const candidate=foodsByName.get(normalizedFoodName(pantryRow.item));
        if(candidate&&hasUsableNutrition(candidate)){
          db.run('UPDATE pantry SET food_id=? WHERE id=?',[candidate.food_id,pantryRow.id]);
          repairedPantryLinks++;
        }else unresolvedPantry.push({item:pantryRow.item,food_id:pantryRow.food_id||''});
      }
      warnings+=unresolvedPantry.length;

      stage='Validating imported data';sheet='';rowNumber=null;
      const scalar=sql=>Number(db.query(sql)[0]?.count||0);
      const actualFoods=scalar('SELECT COUNT(*) AS count FROM foods');
      const actualPantry=scalar('SELECT COUNT(*) AS count FROM pantry');
      const actualRecipes=scalar('SELECT COUNT(*) AS count FROM recipes');
      const actualImportedMeals=scalar("SELECT COUNT(*) AS count FROM meals WHERE source='workbook'");
      const actualRestaurants=scalar('SELECT COUNT(*) AS count FROM restaurants');
      if(actualFoods!==importedFoods)throw new Error(`Foods verification failed: expected ${importedFoods}, found ${actualFoods}.`);
      if(actualPantry!==importedPantry)throw new Error(`Pantry verification failed: expected ${importedPantry}, found ${actualPantry}.`);
      if(actualRecipes!==importedRecipes)throw new Error(`Recipes verification failed: expected ${importedRecipes}, found ${actualRecipes}.`);
      if(wb.Sheets['Meal Log']&&actualImportedMeals!==importedMeals)throw new Error(`Meal Log verification failed: expected ${importedMeals}, found ${actualImportedMeals}.`);
      if(wb.Sheets['Restaurant Guide']&&actualRestaurants!==importedRestaurants)throw new Error(`Restaurant Guide verification failed: expected ${importedRestaurants}, found ${actualRestaurants}.`);

      // Refresh historical meal links and nutrition after canonical food records are loaded.
      db.run(`UPDATE meals SET food_id=(SELECT f.food_id FROM foods f WHERE LOWER(TRIM(f.name))=LOWER(TRIM(meals.food_name)) LIMIT 1)
        WHERE (food_id IS NULL OR food_id='') AND food_name IS NOT NULL`);
      db.run(`UPDATE meals SET
        calories=COALESCE((SELECT f.calories * meals.amount / NULLIF(f.default_serving,0) FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id)),calories),
        protein=COALESCE((SELECT f.protein * meals.amount / NULLIF(f.default_serving,0) FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id)),protein),
        carbs=COALESCE((SELECT f.carbs * meals.amount / NULLIF(f.default_serving,0) FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id)),carbs),
        fiber=COALESCE((SELECT f.fiber * meals.amount / NULLIF(f.default_serving,0) FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id)),fiber),
        fat=COALESCE((SELECT f.fat * meals.amount / NULLIF(f.default_serving,0) FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id)),fat),
        saturated_fat=COALESCE((SELECT f.saturated_fat * meals.amount / NULLIF(f.default_serving,0) FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id)),saturated_fat),
        nutrition_known=CASE WHEN EXISTS(SELECT 1 FROM foods f WHERE UPPER(f.food_id)=UPPER(meals.food_id) AND f.nutrition_known=1) THEN 1 ELSE 0 END
        WHERE food_id IS NOT NULL`);

      db.run('INSERT INTO import_history(imported_at,file_name,foods,pantry,recipes,warnings,status,duration_ms,error_message) VALUES (?,?,?,?,?,?,?,?,?)',[
        new Date().toISOString(),file.name,importedFoods,importedPantry,importedRecipes,warnings,'success',Math.round(performance.now()-started),null
      ]);
    });
    return {foods:importedFoods,pantry:importedPantry,recipes:importedRecipes,meals:importedMeals,restaurants:importedRestaurants,healthMetrics:importedHealthMetrics,labs:importedLabs,workoutSessions:importedWorkoutSessions,workoutSets:importedWorkoutSets,goals:importedGoals,context:importedContext,sleep:importedSleep,coverage,warnings,durationMs:Math.round(performance.now()-started),schemaReport,repairedPantryLinks,unresolvedPantry,mappingReport:{
      foods:{mapped:Object.keys(maps.foods.resolved).length,unmapped:maps.foods.unmapped},pantry:{mapped:Object.keys(maps.pantry.resolved).length,unmapped:maps.pantry.unmapped},recipes:{mapped:Object.keys(maps.recipes.resolved).length,unmapped:maps.recipes.unmapped},meals:{mapped:Object.keys(maps.meals.resolved).length,unmapped:maps.meals.unmapped}
    }};
  }catch(error){
    const detail=error instanceof Error?error.message:String(error||'Unknown error');
    const location=[sheet,rowNumber?`row ${rowNumber}`:''].filter(Boolean).join(', ');
    const full=`${stage}${location?` (${location})`:''}: ${detail}`;
    try{await recordImportFailure({fileName:file?.name||'',durationMs:Math.round(performance.now()-started),errorMessage:full})}catch{}
    throw new Error(full);
  }
}

export function nutritionFor(food,amount,unit){
  const base=Number(food.default_serving)||1;const qty=Number(amount)||0;
  const ratio=(unit===food.unit||!unit||!food.unit)?qty/base:qty;
  const calc=k=>(Number(food[k])||0)*ratio;
  return {calories:calc('calories'),protein:calc('protein'),carbs:calc('carbs'),fiber:calc('fiber'),fat:calc('fat'),saturated_fat:calc('saturated_fat'),sodium:calc('sodium'),potassium:calc('potassium'),cholesterol:calc('cholesterol'),added_sugar:calc('added_sugar'),total_sugar:calc('total_sugar'),caffeine:calc('caffeine'),alcohol:calc('alcohol'),calcium:calc('calcium'),iron:calc('iron'),vitamin_d:calc('vitamin_d'),vitamin_c:calc('vitamin_c'),magnesium:calc('magnesium'),omega_3:calc('omega_3'),monounsaturated_fat:calc('monounsaturated_fat'),polyunsaturated_fat:calc('polyunsaturated_fat'),known:Number(food.nutrition_known)===1};
}
