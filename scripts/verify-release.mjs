import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));
const main=fs.readFileSync('src/main.jsx','utf8');
const engine=fs.readFileSync('src/decision/engine.js','utf8');
const worker=fs.readFileSync('public/sw.js','utf8');
const notes=fs.readFileSync('ReleaseNotes.md','utf8');
const required=['app','version','release','schema_version','build_date','status','completed_story','baseline_story','updated'];
const errors=[];
for(const key of required)if(!(key in meta))errors.push(`VERSION.json missing ${key}`);
const ui=/const VERSION='([^']+)'/.exec(main)?.[1];
const engineVersion=/ENGINE_VERSION = '([^']+)'/.exec(engine)?.[1];
const cacheVersion=/fizz-health-v([^']+)/.exec(worker)?.[1];

const build=/const BUILD_ID='([^']+)'/.exec(main)?.[1];
const deployment=/const DEPLOYMENT_ID='([^']+)'/.exec(main)?.[1];
const created=/const RELEASE_CREATED_AT='([^']+)'/.exec(main)?.[1];
if(build!==meta.build)errors.push(`UI build ${build||'missing'} != VERSION.json ${meta.build}`);
if(deployment!==meta.release_id)errors.push(`UI deployment ${deployment||'missing'} != VERSION.json ${meta.release_id}`);
if(created!==meta.created_at)errors.push(`UI release timestamp ${created||'missing'} != VERSION.json ${meta.created_at}`);
for(const token of ['Application version</span><b>{VERSION}','Build identifier</span><b>{BUILD_ID}','Deployment</span><b>{DEPLOYMENT_ID}'])if(!main.includes(token))errors.push(`About screen is not bound to centralized metadata: ${token}`);
const releaseHistory=JSON.parse(fs.readFileSync('release-history.json','utf8'));
const current=releaseHistory.releases?.[0];
if(current?.version!==meta.version||current?.build!==meta.build||current?.release_id!==meta.release_id)errors.push('release-history.json current release is stale or inconsistent');
for(const [label,value] of [['package.json',pkg.version],['UI',ui],['decision engine',engineVersion],['service worker cache',cacheVersion]])if(value!==meta.version)errors.push(`${label} version ${value||'missing'} != VERSION.json ${meta.version}`);
if(!notes.includes(`v${meta.version}`))errors.push(`ReleaseNotes.md does not identify v${meta.version}`);
if(!notes.includes(meta.completed_story))errors.push(`ReleaseNotes.md does not identify ${meta.completed_story}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Release metadata verified: v${meta.version} / ${meta.completed_story}`);
