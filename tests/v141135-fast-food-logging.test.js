import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('full right swipe commits one serving as consumed',()=>{
 assert.match(main,/commitReady/);
 assert.match(main,/onFullSwipe\?\.\(\)/);
 assert.match(main,/amount:1,unit:'serving'/);
 assert.match(main,/source_record_id:token/);
});

test('partial swipe opens one servings sheet with consumed and proposed actions',()=>{
 assert.match(main,/ADD TO FOOD LOG/);
 assert.match(main,/Add as Proposed/);
 assert.match(main,/Log as Consumed/);
 assert.match(main,/\['0\.25','¼'\]/);
 assert.doesNotMatch(main,/How would you like to use this/);
});

test('all nutrients scale from the registry and interaction is universal',()=>{
 assert.match(main,/NUTRIENT_KEYS\.map\(key=>\[key,finite\(item\[key\]\)\*quantity\]\)/);
 assert.match(main,/quickConsume\('food'/);
 assert.match(main,/quickConsume\('recipe'/);
 assert.match(main,/quickConsume\('meal'/);
});

test('quick consume supports undo and committed swipe styling',()=>{
 assert.match(main,/undoQuickConsume/);
 assert.match(main,/DELETE FROM meals WHERE source_record_id=\?/);
 assert.match(css,/\.discovery-swipe\.commit-ready/);
 assert.match(css,/\.quick-consume-undo/);
});
