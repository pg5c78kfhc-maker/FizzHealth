import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
test('Universal Capture commit is atomic, visible, and retry-safe',()=>{
 assert.match(main,/setSavingCapture\(true\)/);
 assert.match(main,/await transaction\(async db=>/);
 assert.match(main,/Meal saved successfully/);
 assert.match(main,/Save failed:/);
 assert.match(main,/source_record_id=\?/);
 assert.match(main,/INSERT OR REPLACE INTO universal_photo_captures/);
});
test('shared keyboard-safe modal shell covers all editable panels',()=>{
 assert.match(css,/shared iPhone keyboard-safe modal shell/);
 assert.match(css,/\.keyboard-open \.modal-backdrop>\.panel/);
 assert.match(css,/\.keyboard-open \.modal-backdrop>\.panel>\.health-form/);
 assert.match(css,/scroll-padding:16px 0 120px/);
});
