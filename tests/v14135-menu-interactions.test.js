import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');

test('v1.4.13.5 removes meal container Add buttons',()=>{
 assert.doesNotMatch(main,/className="meal-add-button"/);
 assert.doesNotMatch(main,/setPicker\(\{slot,kind:'main'\}\)/);
});

test('Today menu supports persistent favorites, ranking, and filters',()=>{
 assert.match(main,/fizz-menu-preferences/);
 assert.match(main,/toggleFavorite/);
 assert.match(main,/shiftRank/);
 assert.match(main,/Today’s Menu filters/);
 assert.match(main,/Favorites/);
});

test('Today menu cards use tap-to-add as primary interaction',()=>{
 assert.match(main,/onAdd=\{addFromMenu\}/);
 assert.match(main,/if\(!wasMoved\)onAdd\(meal\)/);
 assert.match(main,/destinationFor/);
 assert.match(main,/scheduleMeal\(meal,slot,'main'\)/);
});
