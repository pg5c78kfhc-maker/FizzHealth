import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');
const css=fs.readFileSync('src/styles.css','utf8');

test('release metadata is current',()=>{
 assert.match(main,/VERSION='1\.4\.15\.28'/);
 assert.match(main,/BUILD_ID='141528'/);
 assert.match(db,/TARGET_SCHEMA_VERSION=75/);
});
test('Pantry exposes a barcode reconciliation entry point',()=>{
 assert.match(main,/aria-label="Scan pantry barcode"/);
 assert.match(main,/onReconcile=\{\(\)=>visit\('pantry-reconcile'\)\}/);
 assert.match(main,/function PantryReconciliation/);
});
test('scanner supports camera detection and manual fallback',()=>{
 assert.match(main,/BarcodeDetector/);
 assert.match(main,/getUserMedia/);
 assert.match(main,/Enter barcode manually/);
 assert.match(main,/ean_13/);
 assert.match(main,/upc_a/);
});
test('unknown scans search existing foods before creation',()=>{
 assert.match(main,/Find Existing Foods/);
 assert.match(main,/POSSIBLE EXISTING MATCHES/);
 assert.match(main,/None of these — Create New Food/);
 assert.match(main,/barcodeCandidates/);
});
test('barcode persistence and scan audit schema exist',()=>{
 assert.match(db,/CREATE TABLE IF NOT EXISTS barcode_scan_events/);
 assert.match(main,/UPDATE foods SET barcode=/);
 assert.match(main,/INSERT INTO barcode_scan_events/);
});
test('reconciliation UI styles are isolated',()=>{
 assert.match(css,/v1\.4\.15\.28 — Pantry barcode reconciliation foundation/);
 assert.match(css,/\.barcode-camera-page/);
 assert.match(css,/\.reconcile-progress/);
});
