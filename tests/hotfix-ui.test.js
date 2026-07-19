import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('HF safe deletion archives foods and preserves meal history',()=>{
 assert.match(main,/UPDATE foods SET archived=1,archived_at=/);
 assert.doesNotMatch(main,/DELETE FROM meals WHERE food_id=.*archiveFood/);
 assert.match(main,/Historical meal records will remain unchanged/);
});

test('HF recipe deletion uses swipe-left and archives all recipe rows',()=>{
 assert.match(main,/SwipeArchiveCard/);
 assert.match(main,/UPDATE recipes SET archived=1,archived_at=/);
 assert.match(main,/view==='recipes'/);
});

test('HF editor is fixed, closable, unit-aware, and previews macro impact',()=>{
 assert.match(main,/className="panel meal-entry fixed-editor"/);
 assert.match(main,/aria-label="Close food editor"/);
 assert.match(main,/aria-label="Serving unit"/);
 assert.match(main,/Projected today/);
 assert.match(css,/max-height:calc\(100dvh/);
});

test('HF migration adds archive fields without rewriting historical records',()=>{
 assert.match(db,/version:28,name:'hotfix_safe_archiving'/);
 assert.match(db,/ALTER TABLE foods ADD COLUMN archived/);
 assert.match(db,/ALTER TABLE recipes ADD COLUMN archived/);
});
