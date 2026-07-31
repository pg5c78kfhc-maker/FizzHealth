import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('unknown Library barcodes open a resolver instead of New Food directly',()=>{
 assert.match(main,/setUnknownLibraryBarcode\(code\)/);
 assert.doesNotMatch(main,/if\(existing\)\{setRecipeDetail[\s\S]{0,150}setAiExchange\(\{operation:'create_food',initialBarcode:code\}\)/);
 assert.match(main,/function UnknownBarcodeResolver/);
});

test('resolver supports matching an existing Food record',()=>{
 assert.match(main,/Match to existing food/);
 assert.match(main,/INSERT OR REPLACE INTO food_barcodes/);
 assert.match(main,/UPDATE foods SET barcode=CASE WHEN/);
 assert.match(main,/onLinked\(food\)/);
});

test('resolver preserves explicit Create New Food and Cancel choices',()=>{
 assert.match(main,/Create new food/);
 assert.match(main,/setAiExchange\(\{operation:'create_food',initialBarcode:code\}\)/);
 assert.match(main,/Return to the Library without using this barcode/);
});

test('resolver uses the existing scanner and barcode match styling',()=>{
 assert.match(main,/CameraBarcodeScanner contextLabel="LIBRARY"/);
 assert.match(main,/barcode-match-list unknown-barcode-match-list/);
 assert.match(css,/Unknown Library barcode resolution/);
});
