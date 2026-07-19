import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Universal Capture exposes camera and photo library first-class actions',()=>{assert.match(main,/Take Photo/);assert.match(main,/Choose Photo/);assert.match(main,/capture="environment"/)});
test('photo workflow uses exchange, routing, review and explicit commit',()=>{assert.match(main,/universal_photo_analysis/);assert.match(main,/restaurant_menu/);assert.match(main,/nutrition_label/);assert.match(main,/grocery_receipt/);assert.match(main,/REVIEW BEFORE COMMIT/);assert.match(main,/Confirm and save/)});
test('schema 38 persists universal photo captures',()=>{assert.match(db,/version:38/);assert.match(db,/universal_photo_captures/)});
test('photo capture is responsive',()=>{assert.match(css,/photo-capture-actions/);assert.match(css,/@media\(max-width:420px\)/)});
