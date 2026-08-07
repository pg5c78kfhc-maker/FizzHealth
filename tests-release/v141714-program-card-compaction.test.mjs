import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const version = JSON.parse(fs.readFileSync(new URL('../VERSION.json', import.meta.url), 'utf8'));

test('Active cards suppress redundant Active badge and Active action', () => {
  assert.match(main, /activeTab!==\'active\'&&<span className=\{`workout-status/);
  assert.doesNotMatch(main, /program-run-button active/);
});

test('Active program cards opt into compact layout class', () => {
  assert.match(main, /activeTab===\'active\'\?\'active-program-card\'/);
  assert.match(css, /\.workout-program-card\.no-program-icon\.active-program-card\{[\s\S]*?min-height:0;[\s\S]*?padding:14px 14px 42px;/);
});

test('Program copy gets full width while only the title reserves action space', () => {
  assert.match(css, /active-program-card \.workout-program-copy\{[\s\S]*?width:100%;/);
  assert.match(css, /active-program-card \.workout-program-title\{[\s\S]*?padding-right:94px;/);
  assert.match(css, /active-program-card \.workout-program-copy p\{[\s\S]*?width:100%;/);
});

test('Program disclosure chevron is centered on the bottom edge', () => {
  assert.match(css, /active-program-card \.workout-program-open>svg\{[\s\S]*?position:absolute;[\s\S]*?left:50%;[\s\S]*?bottom:10px;[\s\S]*?translateX\(-50%\)/);
});

test('Release metadata stays schema-compatible', () => {
  assert.equal(version.version, '1.4.17.14');
  assert.equal(version.schema_version, 146);
});
