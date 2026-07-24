import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8'),css=fs.readFileSync('src/styles.css','utf8'),meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));
test('release metadata is current',()=>{assert.equal(meta.version,'1.4.11.20');assert.equal(meta.build,'141320');assert.equal(meta.schema_version,54)});
test('restaurant cards use toolbar and vertical metric stack',()=>{assert.match(main,/restaurant-card-toolbar/);assert.match(main,/restaurant-metric-stack/);assert.match(main,/label="Prot"/);assert.match(main,/label="Chol"/);assert.match(css,/grid-row:1 \/ span 2/)});
test('nutrition editor follows X pencil check protocol and protects dirty state',()=>{assert.match(main,/nutrition-head-actions/);assert.match(main,/disabled=\{saving\|\|!dirty\}/);assert.match(main,/Discard unsaved nutrition changes/)});
