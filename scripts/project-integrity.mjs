import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const repair=process.argv.includes('--repair');
const ignored=new Set(['node_modules','dist','.git','.integrity-backups']);
const appMarkers=['package.json','index.html','src'];

function walk(dir,depth=0,out=[]){
  if(depth>5)return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(!ent.isDirectory()||ignored.has(ent.name))continue;
    const p=path.join(dir,ent.name);
    if(appMarkers.every(m=>fs.existsSync(path.join(p,m))))out.push(p);
    walk(p,depth+1,out);
  }
  return out;
}
function validApp(dir){return appMarkers.every(m=>fs.existsSync(path.join(dir,m)));}
function rel(p){return path.relative(root,p)||'.';}

const rootValid=validApp(root);
let nested=walk(root);
const actions=[];

if(repair){
  if(!rootValid){
    if(nested.length===1){
      const source=nested[0];
      for(const name of fs.readdirSync(source)){
        const from=path.join(source,name),to=path.join(root,name);
        if(fs.existsSync(to))throw new Error(`Cannot promote ${rel(source)}: root already contains ${name}`);
        fs.renameSync(from,to);
      }
      fs.rmSync(source,{recursive:true,force:true});
      actions.push(`Promoted ${rel(source)} to the application root.`);
    }else{
      throw new Error(`No valid root application and ${nested.length} nested candidates were found; automatic repair is ambiguous.`);
    }
  }
  nested=walk(root);
  for(const duplicate of nested){
    fs.rmSync(duplicate,{recursive:true,force:true});
    actions.push(`Removed duplicate application tree ${rel(duplicate)}.`);
  }
}

nested=walk(root);
if(!validApp(root))throw new Error('Project integrity failure: the root is not a complete application.');
if(nested.length)throw new Error(`Project integrity failure: duplicate application tree(s): ${nested.map(rel).join(', ')}`);

const rootPackage=path.join(root,'package.json');
if(!fs.existsSync(rootPackage))throw new Error('Project integrity failure: root package.json is missing.');
if(!fs.statSync(rootPackage).isFile())throw new Error('Project integrity failure: root package.json is not a file.');



// Protected implementation checks: prevent the historical duplicate-UI failure mode.
const mainSource=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const styleSource=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
const menuChefClassCount=(mainSource.match(/className="menu-category menu-chef-section"/g)||[]).length;
if(menuChefClassCount!==1)throw new Error(`Project integrity failure: expected one live Menu Chef section, found ${menuChefClassCount}.`);
if(mainSource.includes('className="menu-category chef-section"'))throw new Error('Project integrity failure: Menu and standalone Chef page share the legacy chef-section class.');
for(const obsolete of ['v1.4.15.8 stabilization: exact Menu stack geometry','v1.4.15.9 — structural Menu geometry']){
  if(styleSource.includes(obsolete))throw new Error(`Project integrity failure: superseded Menu override remains: ${obsolete}`);
}
const canonicalMenuCount=(styleSource.match(/CANONICAL Menu\/Chef layout/g)||[]).length;
if(canonicalMenuCount!==1)throw new Error(`Project integrity failure: expected one canonical Menu/Chef layout block, found ${canonicalMenuCount}.`);

console.log(`Project integrity OK: one application root (${rel(root)}), one package.json, one src tree, one isolated Menu/Chef implementation.`);
for(const action of actions)console.log(`Repair: ${action}`);
