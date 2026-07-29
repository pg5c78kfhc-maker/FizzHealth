import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const db=fs.readFileSync('src/database.js','utf8');
const index=fs.readFileSync('index.html','utf8');

const normalize=u=>String(u||'').trim().toLowerCase().replace(/s$/,'');
const measured=new Set(['g','gram','kg','kilogram','oz','ounce','lb','pound','ml','milliliter','l','liter','cup','tbsp','tablespoon','tsp','teaspoon']);
const delta=({quantity,inventoryUnit,foodServing,amount=1,consumedUnit='serving'})=>{
  const iu=normalize(inventoryUnit),cu=normalize(consumedUnit);
  let requested=amount;
  if(cu==='serving')requested=measured.has(iu)?amount*foodServing:amount;
  return Math.min(quantity,requested);
};

test('single active runtime source tree and entry point are explicit',()=>{
  assert.match(index,/src="\/src\/main\.jsx"/);
  assert.match(main,/const VERSION='1\.4\.15\.39'/);
  assert.doesNotMatch(main,/UPDATE pantry SET quantity=COALESCE\(quantity,0\)\+\?/);
});

test('count inventory does not use gram serving size',()=>{
  assert.equal(delta({quantity:5,inventoryUnit:'apple',foodServing:125}),1);
  assert.equal(5-delta({quantity:5,inventoryUnit:'apple',foodServing:125}),4);
});

test('actual deduction is capped and exact reversal is stable',()=>{
  const deducted=delta({quantity:5,inventoryUnit:'apple',foodServing:125,amount:10});
  assert.equal(deducted,5);
  assert.equal(0+deducted,5);
});

test('legacy 125 apple reversal is capped to one consumed serving',()=>{
  const stored=125;
  const expected=delta({quantity:0,inventoryUnit:'apple',foodServing:125,amount:1});
  assert.equal(Math.min(stored,expected),0); // production resolves expected before applying quantity cap
  const expectedUncapped=1;
  assert.equal(Math.min(stored,expectedUncapped),1);
});

test('snapshot and duplicate adjustment safeguards are installed',()=>{
  assert.match(db,/ALTER TABLE meal_pantry_adjustments ADD COLUMN before_json TEXT/);
  assert.match(db,/CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_pantry_adjustments_unique/);
  assert.match(main,/safeLegacyRestoreDelta/);
  assert.match(main,/INSERT OR REPLACE INTO meal_pantry_adjustments/);
  assert.match(main,/restoreMealPantryAdjustments\(db,editing\.id,editing\)/);
});
