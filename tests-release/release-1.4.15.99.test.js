import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('2026 Quest panel stores 27 numeric results and one non-reported calculation',()=>{
 const migration=db.slice(db.indexOf("version:99"),db.indexOf('const canonicalNutrientColumns'));
 const tuples=[...migration.matchAll(/\('([^']+)',(NULL|[-0-9.]+),(NULL|'Not reported')/g)];
 assert.equal(tuples.length,28);
 assert.equal(tuples.filter(x=>x[2]!=='NULL').length,27);
 assert.match(migration,/\('BUN\/Creatinine Ratio',NULL,'Not reported'/);
});
test('stored Quest ranges and separate eGFR methods are present',()=>{
 assert.match(db,/eGFR, Creatinine-Based[\s\S]*'creatinine-based'/);
 assert.match(db,/eGFR, Cystatin-C-Based[\s\S]*'cystatin-C-based'/);
 assert.match(db,/Total Cholesterol',255,NULL,'mg\/dL',NULL,200,'<'/);
 assert.match(db,/HDL Cholesterol',58,NULL,'mg\/dL',40,NULL,'>='/);
});
test('Labs status uses stored ranges only and canonical names',()=>{
 assert.doesNotMatch(main,/LAB_RANGE_RULES/);
 assert.match(main,/function canonicalLabName/);
 assert.match(main,/if\(!range\)return 'Range not stored'/);
});
test('Labs presentation aligns icon, values, units, and ranges',()=>{
 assert.match(css,/\.health-labs-card \.health-icon\{display:grid;place-items:center/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) 94px minmax\(86px,auto\) minmax\(92px,auto\)/);
 assert.match(css,/\.lab-value-pill\.in\{background:#8ee337;color:#050805\}/);
 assert.match(css,/\.lab-value-pill\.out\{background:#e92525;color:#fff\}/);
});
