import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('app tracks the keyboard-reduced visual viewport',()=>{
  assert.match(main,/window\.visualViewport/);
  assert.match(main,/--visual-viewport-height/);
  assert.match(main,/visualViewport.*addEventListener\('resize'/s);
});

test('modal forms are bounded to the visible viewport and scroll internally',()=>{
  assert.match(css,/height:var\(--visual-viewport-height,100dvh\)/);
  assert.match(css,/modal-backdrop>\.panel[\s\S]*max-height:calc\(var\(--visual-viewport-height/);
  assert.match(css,/\.editor-scroll,\.health-form,\.nutrition-scroll[\s\S]*overflow-y:auto/);
  assert.match(css,/\.editor-actions[\s\S]*position:sticky/);
});

test('Universal Capture keeps header and actions outside its scrollable body',()=>{
  assert.match(main,/universal-capture fixed-editor/);
  assert.match(main,/edit-head sticky-head/);
  assert.match(main,/className="editor-scroll"[\s\S]*className="editor-actions"/);
  assert.match(css,/\.universal-capture textarea[\s\S]*resize:none/);
});
