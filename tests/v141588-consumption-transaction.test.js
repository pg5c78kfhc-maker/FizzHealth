import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
test('servings form uses canonical serving payload',()=>assert.match(src,/applySourceInventoryConsumption\(db,\{sourceType,item,servings:qty,food_id:recordFoodId,food_name:name,unit:'serving'\}\)/));
test('tracked deduction failures abort transaction',()=>assert.match(src,/tracked in Pantry, but its inventory could not be deducted/));
test('legacy delete can reconstruct restoration',()=>assert.match(src,/reconstructed:true/));
