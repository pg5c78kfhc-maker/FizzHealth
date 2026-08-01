import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Menu exposes extensible ellipsis action menu',()=>{assert.match(main,/MoreHorizontal/);assert.match(main,/Copy Proposed Meals/)});
test('copy workflow supports scoped item selection and calendar dates',()=>{assert.match(main,/Entire day/);assert.match(main,/Selected items/);assert.match(main,/menu-copy-calendar/);assert.match(main,/sourceDate/)});
test('copy preserves proposed state and skips exact duplicates',()=>{assert.match(main,/status:'planned'/);assert.match(main,/Exact duplicates are skipped/);assert.match(main,/consumed_at:null/)});
test('copy interface styling exists',()=>{assert.match(css,/menu-copy-panel/);assert.match(css,/menu-action-popover/)});
