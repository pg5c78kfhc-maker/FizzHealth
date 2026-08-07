const CURLY_DOUBLE_QUOTES=/[\u201C\u201D\u201E\u201F]/;

function normalizeSmartJsonQuotes(input){
  const text=String(input??'');
  let out='';
  let inString=false;
  let escaped=false;
  for(let i=0;i<text.length;i+=1){
    const ch=text[i];
    if(escaped){out+=ch;escaped=false;continue}
    if(inString&&ch==='\\'){out+=ch;escaped=true;continue}
    if(ch==='"'){
      out+=ch;
      inString=!inString;
      continue
    }
    if(CURLY_DOUBLE_QUOTES.test(ch)){
      if(!inString){out+='"';inString=true;continue}
      const rest=text.slice(i+1);
      const next=(rest.match(/\S/)||[''])[0];
      if(ch==='\u201D'||ch==='\u201F'||ch==='\u201E'){
        if(!next||next===':'||next===','||next==='}'||next===']'){
          out+='"';inString=false;continue
        }
      }
      out+='\\"';
      continue
    }
    out+=ch
  }
  return out
}

export function normalizeWorkoutCalorieResponseText(raw){
  let text=String(raw??'').replace(/^\uFEFF/,'').trim();
  text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
  text=text.replace(/\u00A0/g,' ');
  const firstBrace=text.indexOf('{');
  const lastBrace=text.lastIndexOf('}');
  if(firstBrace>=0&&lastBrace>firstBrace)text=text.slice(firstBrace,lastBrace+1);
  return normalizeSmartJsonQuotes(text).trim()
}

export function parseWorkoutCalorieResponse(raw,executionId){
  const clean=normalizeWorkoutCalorieResponseText(raw);
  if(!clean)throw new Error('No calorie estimate JSON was found on the clipboard.');
  let payload;
  try{payload=JSON.parse(clean)}catch{
    throw new Error('Could not read the calorie estimate JSON. Copy the ChatGPT JSON response and try again.')
  }
  if(Number(payload.schema_version)!==1||payload.exchange_type!=='fizz_health_workout_calorie_estimate_response')throw new Error('This is not a supported Fizz Health calorie estimate response.');
  if(String(payload.workout_execution_id)!==String(executionId))throw new Error('The calorie estimate belongs to a different workout.');
  const calories=Number(payload.estimated_calories);
  if(!Number.isFinite(calories)||calories<0)throw new Error('estimated_calories must be a non-negative number.');
  const optionalNumber=key=>payload[key]==null?payload[key]:Number(payload[key]);
  for(const key of ['estimated_calories_low','estimated_calories_high']){
    const value=optionalNumber(key);
    if(value!=null&&(!Number.isFinite(value)||value<0))throw new Error(`${key} must be a non-negative number when provided.`);
    if(value!=null)payload[key]=value
  }
  return {...payload,estimated_calories:calories}
}
