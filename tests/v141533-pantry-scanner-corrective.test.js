import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const database=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('Pantry counting unit persists independently of package-size unit',()=>{
 assert.match(main,/savedUnit=String\(form\.get\('unit'\)/);
 assert.doesNotMatch(main,/savedUnit=\(canCalculateTotal\?containerUnit/);
 assert.match(main,/What are you counting\?/);
 assert.match(main,/pantry-counting-units/);
});

test('barcode scanner scans the full frame faster and applies camera focus improvements',()=>{
 const component=main.slice(main.indexOf('function CameraBarcodeScanner'),main.indexOf('function PantryReconciliation'));
 assert.match(component,/now-lastScan>100/);
 assert.match(component,/focusMode:\{ideal:'continuous'\}/);
 assert.match(component,/applyConstraints/);
 assert.match(component,/full-frame/);
 assert.match(css,/barcode-target\.full-frame/);
});

test('barcode scanner supports high-resolution still-image decoding and crop retries',()=>{
 const component=main.slice(main.indexOf('function CameraBarcodeScanner'),main.indexOf('function PantryReconciliation'));
 assert.match(component,/captureStill/);
 assert.match(component,/Checking a still image/);
 assert.match(component,/Scan Now/);
 assert.match(component,/const crops=/);
 assert.match(main,/function decodeBarcodeImage/);
});

test('release metadata identifies v1.4.15.33 consistently',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.33'/);
 assert.match(main,/const BUILD_ID='141533'/);
 assert.match(main,/Pantry Persistence and Barcode Scanner Corrective/);
 assert.match(database,/version:78/);
 assert.match(database,/1\.4\.15\.33/);
});
