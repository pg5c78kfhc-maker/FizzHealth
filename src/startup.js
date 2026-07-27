const STORAGE_KEY='fizz-startup-diagnostics-v1';

const now=()=>typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();

export function createStartupDiagnostics(storage=typeof localStorage!=='undefined'?localStorage:null){
  const startedAt=now();
  const phases=[];
  let current=null;
  const persist=summary=>{
    try{storage?.setItem(STORAGE_KEY,JSON.stringify(summary))}catch{}
    return summary;
  };
  return {
    start(name){
      if(current)this.end(current.name,'completed');
      current={name,startedAt:now()};
      return current;
    },
    end(name=current?.name,status='completed',detail=''){
      const phase=current?.name===name?current:{name,startedAt:now()};
      const endedAt=now();
      phases.push({name,status,detail,durationMs:Math.max(0,Math.round(endedAt-phase.startedAt))});
      if(current?.name===name)current=null;
      return phases.at(-1);
    },
    finish(status='ready',error=''){
      if(current)this.end(current.name,status==='ready'?'completed':'failed',error);
      return persist({status,error,startedAt:new Date().toISOString(),durationMs:Math.max(0,Math.round(now()-startedAt)),phases});
    }
  };
}

export function scheduleDeferredWork(work,{delay=0,onError=console.warn}={}){
  let cancelled=false;
  const execute=async()=>{
    if(cancelled)return;
    try{await work()}catch(error){onError(error)}
  };
  let cancel;
  if(typeof requestIdleCallback==='function'){
    const id=requestIdleCallback(execute,{timeout:1500});
    cancel=()=>cancelIdleCallback(id);
  }else{
    const id=setTimeout(execute,delay);
    cancel=()=>clearTimeout(id);
  }
  return()=>{cancelled=true;cancel?.()};
}

export function readStartupDiagnostics(storage=typeof localStorage!=='undefined'?localStorage:null){
  try{return JSON.parse(storage?.getItem(STORAGE_KEY)||'null')}catch{return null}
}

export function withStartupTimeout(promise,timeoutMs=12000,message='Startup timed out.'){
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),timeoutMs)});
  return Promise.race([Promise.resolve(promise),timeout]).finally(()=>clearTimeout(timer));
}
