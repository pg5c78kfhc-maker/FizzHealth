import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('scanner requests the rear camera before choosing a decoder',()=>{
 const component=main.slice(main.indexOf('function CameraBarcodeScanner'),main.indexOf('function PantryReconciliation'));
 assert.match(component,/navigator\.mediaDevices\.getUserMedia/);
 assert.ok(component.indexOf('getUserMedia') < component.indexOf("'BarcodeDetector' in window"));
 assert.match(component,/facingMode:\{ideal:'environment'\}/);
 assert.match(component,/video\.srcObject=stream/);
 assert.match(component,/await video\.play\(\)/);
});

test('Safari fallback decodes UPC-A and EAN-13 without BarcodeDetector',()=>{
 assert.match(main,/function decodeEANLine/);
 assert.match(main,/function decodeEANBits/);
 assert.match(main,/function decodeBarcodeCanvas/);
 assert.match(main,/barcodeChecksumValid/);
 assert.match(main,/else\{const canvas=canvasRef\.current/);
});

test('scanner exposes startup, denial, and retry states',()=>{
 assert.match(main,/Starting camera…/);
 assert.match(main,/Camera access was denied/);
 assert.match(main,/Retry Camera/);
 assert.match(css,/barcode-camera-frame\.starting/);
 assert.match(css,/barcode-camera-frame\.error/);
});

test('release metadata identifies v1.4.15.29',()=>{
 assert.match(main,/const VERSION='1\.4\.15\.29'/);
 assert.match(main,/const BUILD_ID='141529'/);
 assert.match(main,/iPhone Barcode Camera Corrective/);
});
