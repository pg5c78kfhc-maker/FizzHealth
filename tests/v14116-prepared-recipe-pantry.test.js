import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
test('v1.4.11.8 metadata is current',()=>{assert.equal(meta.version,'1.4.11.19');assert.equal(meta.build,'141319');assert.match(main,/const VERSION='1\.4\.11\.19'/)});
test('recipe detail can create a prepared pantry batch',()=>{assert.match(main,/function RecipePantryBatchEditor/);assert.match(main,/Add prepared batch to pantry/);assert.match(main,/food_id:foodId/);assert.match(main,/prepared_recipe_batch/)});
test('pantry pencil opens the editor above the current detail',()=>{assert.match(main,/setSelectedPantry\(scoreItem\)/);assert.match(main,/pantry-editor-layer/)});
