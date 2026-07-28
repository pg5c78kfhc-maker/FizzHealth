import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('retailer browsing and persistence are present',()=>{
 assert.match(main,/\['retailer','By Retailer'\]/);
 assert.match(main,/fizz-pantry-view/);
 assert.match(main,/pantry-retailer-group/);
 assert.match(main,/Retailer not recorded/);
});

test('Pantry editor uses plain language and retailer suggestions',()=>{
 for(const text of ['Product','What You Have','Freshness','Bought at','How many do you have?','Where is it stored?','Package size']) assert.ok(main.includes(text),text);
 assert.match(main,/SELECT DISTINCT retailer FROM pantry/);
});

test('completeness action is safely implemented',()=>{
 assert.match(main,/function pantryMissingEvidence/);
 assert.match(main,/Record Completeness/);
 assert.match(main,/Missing Information/);
 assert.match(main,/Why this helps/);
});

test('Menu category headings are enlarged',()=>{
 assert.match(css,/font-size:1\.55rem!important/);
 assert.match(css,/font-weight:950!important/);
});

test('release metadata is current',()=>{
 assert.equal(version.version,'1.4.15.31');
 assert.equal(version.build_id,'141531');
 assert.equal(version.release_id,'FH-20260728-141531');
});
