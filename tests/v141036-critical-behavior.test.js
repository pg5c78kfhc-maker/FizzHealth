import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRecipeSnapshot,compactRecipeMealNotes,resolveRecipeFood} from '../src/nutrition/recipe.js';
import {normalizeSqlValue,auditValue} from '../src/exchange/persistence.js';
import {convertQuantity} from '../src/nutrition/units.js';

test('coffee recipe carries caffeine through compatible volume conversion',()=>{
  const recipe=[{id:1,recipe_id:'R-COFFEE',recipe_name:'Coffee Including Sugar Free Creamer',ingredient_id:'F-COFFEE',ingredient_name:'Brewed Black Coffee',amount:8,unit:'fl oz'},{id:2,recipe_id:'R-COFFEE',recipe_name:'Coffee Including Sugar Free Creamer',ingredient_id:'F-CREAMER',ingredient_name:'Coffee-mate Zero Sugar Hazelnut',amount:40,unit:'ml'}];
  const foods=[{food_id:'F-COFFEE',name:'Brewed Black Coffee',default_serving:240,unit:'ml',nutrition_known:1,caffeine:95,calories:0},{food_id:'F-CREAMER',name:'Coffee-mate Zero Sugar Hazelnut',default_serving:40,unit:'ml',nutrition_known:1,caffeine:0,calories:42}];
  const snap=buildRecipeSnapshot(recipe,foods);
  assert.equal(snap.nutrition_known,1);
  assert.ok(Math.abs(snap.nutrition.caffeine-93.64)<0.1);
  assert.equal(snap.nutrition.calories,42);
  assert.equal(snap.issues.length,0);
});

test('recipe ingredient ID wins over duplicate names',()=>{
  const row={ingredient_id:'F-2',ingredient_name:'Brewed Black Coffee'};
  const foods=[{food_id:'F-1',name:'Brewed Black Coffee'},{food_id:'F-2',name:'Brewed Black Coffee'}];
  assert.equal(resolveRecipeFood(row,foods).food.food_id,'F-2');
});

test('ambiguous name-only recipe ingredient is rejected instead of double counted',()=>{
  const snap=buildRecipeSnapshot([{recipe_id:'R1',recipe_name:'Coffee',ingredient_name:'Brewed Black Coffee',amount:8,unit:'fl oz'}],[{food_id:'F1',name:'Brewed Black Coffee',default_serving:8,unit:'fl oz',caffeine:95},{food_id:'F2',name:'Brewed Black Coffee',default_serving:8,unit:'fl oz',caffeine:80}]);
  assert.equal(snap.nutrition_known,0);
  assert.equal(snap.nutrition.caffeine,0);
  assert.match(snap.issues[0],/Multiple foods match/);
});

test('recipe notes are compact and exclude joined food rows',()=>{
  const snap=buildRecipeSnapshot([{recipe_id:'R1',recipe_name:'Coffee',ingredient_id:'F1',ingredient_name:'Coffee',amount:1,unit:'serving'}],[{food_id:'F1',name:'Coffee',default_serving:1,unit:'serving',caffeine:95,notes:'large internal note'}]);
  const parsed=JSON.parse(compactRecipeMealNotes(snap));
  assert.equal(parsed.ingredients[0].nutrition.caffeine,95);
  assert.equal(parsed.ingredients[0].notes,undefined);
});

test('structured enrichment values serialize safely for SQLite',()=>{
  assert.equal(normalizeSqlValue({allergens:['peanuts']},'ingredients_json'),'{"allergens":["peanuts"]}');
  assert.equal(normalizeSqlValue(['peanuts'],'allergens'),'["peanuts"]');
  assert.equal(normalizeSqlValue(true,'verified'),1);
  assert.equal(auditValue({source:'Nutrition Facts'}),'{"source":"Nutrition Facts"}');
});

test('unit conversion supports fluid ounces and milliliters',()=>{
  assert.ok(Math.abs(convertQuantity(8,'fl oz','ml')-236.588)<0.01);
});
