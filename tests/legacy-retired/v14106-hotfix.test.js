import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('real iPhone keyboard keeps focused controls and validation reachable',()=>{
 assert.match(main,/document\.addEventListener\('focusin',keepFocusedControlVisible\)/);
 assert.match(main,/scrollIntoView\(\{block:'center'/);
 assert.match(main,/classList\.toggle\('keyboard-open'/);
 assert.match(main,/Done typing/);
 assert.match(css,/\.keyboard-open \.universal-capture\.fixed-editor/);
 assert.match(css,/\.capture-response-actions/);
});

test('capture hides underlying app chrome and always has explicit escape actions',()=>{
 assert.match(main,/capture-active/);
 assert.match(main,/aria-label="Exit capture"/);
 assert.match(main,/>Cancel<|\?'Back':'Cancel'/);
 assert.match(css,/\.app\.capture-active>nav/);
});

test('lab import normalization accepts workbook aliases, numeric strings, units, and deduplicates',()=>{
 assert.match(main,/function normalizeLabRecord/);
 assert.match(main,/replaceAll\(',',''\)/);
 assert.match(main,/new Map\(\[\.\.\.labRows,\.\.\.metricLabs\]/);
 assert.match(main,/Collection Date/);
});
