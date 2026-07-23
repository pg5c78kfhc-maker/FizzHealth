import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release metadata advances to v1.4.10.43a',()=>{
 assert.equal(meta.version,'1.4.11.16');
 assert.equal(meta.build,'141251');
 assert.match(main,/const VERSION='1\.4\.11\.16'/);
});

test('mobile Highest Impact card uses a full-width single-column layout',()=>{
 assert.match(css,/v1\.4\.10\.42b — definitive iPhone Highest Impact card repair/);
 assert.match(css,/decision-intelligence-content>\.highest-impact-trigger\{[\s\S]*grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/highest-impact-trigger \.assistant-score\{[\s\S]*grid-template-columns:24px auto minmax\(0,1fr\)/);
 assert.match(css,/highest-impact-trigger \.highest-impact-chevron\{display:none\}/);
 assert.match(css,/overflow-wrap:break-word/);
});
