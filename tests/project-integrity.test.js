import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('release contains one canonical application tree',()=>{
  const packages=[];
  const walk=(dir,depth=0)=>{if(depth>5)return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','dist','.git'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p,depth+1);else if(e.name==='package.json')packages.push(p)}};
  walk(process.cwd());
  assert.deepEqual(packages.map(p=>path.relative(process.cwd(),p)),['package.json']);
  assert.equal(fs.existsSync('src/main.jsx'),true);
});

test('integrity checker accepts current tree',()=>{
  const result=spawnSync(process.execPath,['scripts/project-integrity.mjs'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.match(result.stdout,/one application root/);
});

test('approved Food Library is the active implementation',()=>{
  const main=fs.readFileSync('src/main.jsx','utf8');
  assert.match(main,/library-mode-switch/);
  assert.match(main,/Ingredients.*Recipes.*Meals/s);
  assert.match(main,/New Ingredient/);
  assert.doesNotMatch(main,/compact-library-actions/);
});
