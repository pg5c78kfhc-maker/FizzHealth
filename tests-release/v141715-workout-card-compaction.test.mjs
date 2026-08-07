import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const version = JSON.parse(fs.readFileSync(new URL('../VERSION.json', import.meta.url), 'utf8'));

test('workout cards remove the permanent right-side content reservation', () => {
  assert.match(css, /\.nested-workout-header\{\s*padding-right:0;/);
  assert.match(css, /\.nested-workout-header:has\(\.three\)\{\s*padding-right:0;/);
});

test('workout copy uses full card width while title alone clears action buttons', () => {
  assert.match(css, /\.nested-workout-toggle\{[\s\S]*?grid-template-columns:42px minmax\(0,1fr\)/);
  assert.match(css, /\.nested-workout-toggle>div>b\{\s*padding-right:116px;/);
  assert.match(css, /\.nested-workout-toggle b,[\s\S]*?width:100%;/);
});

test('workout disclosure chevron is centered on the bottom edge', () => {
  assert.match(css, /\.nested-workout-toggle>svg\{[\s\S]*?position:absolute;[\s\S]*?left:50%;[\s\S]*?bottom:10px;[\s\S]*?translateX\(-50%\)/);
});

test('existing workout actions and calorie exchange remain wired', () => {
  assert.match(main, /className="nested-card-actions three"/);
  assert.match(main, /className="workout-exchange-actions"/);
  assert.match(main, /className="end-workout-button"/);
});


test('program-card bottom disclosure pattern remains intact', () => {
  assert.match(css, /active-program-card \.workout-program-open>svg\{[\s\S]*?position:absolute;[\s\S]*?left:50%;[\s\S]*?bottom:10px;/);
});

test('release metadata remains schema compatible', () => {
  assert.equal(version.version, '1.4.17.15');
  assert.equal(version.schema_version, 146);
});
