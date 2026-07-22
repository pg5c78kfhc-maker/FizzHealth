export function normalizeSqlValue(value,field='value'){
  if(value===undefined||value===null)return null;
  if(typeof value==='string'||typeof value==='number')return value;
  if(typeof value==='boolean')return value?1:0;
  if(Array.isArray(value)||typeof value==='object'){
    try{return JSON.stringify(value)}catch{throw new Error(`${field} could not be serialized for storage.`)}
  }
  throw new Error(`${field} has unsupported value type ${typeof value}.`);
}

export function auditValue(value){
  if(value===undefined||value===null)return null;
  if(typeof value==='string')return value;
  if(typeof value==='number'||typeof value==='boolean')return String(value);
  try{return JSON.stringify(value)}catch{return String(value)}
}
