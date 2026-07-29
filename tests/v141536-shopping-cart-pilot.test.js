import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('Pantry editor persists a product link',()=>{
  assert.match(main,/name="product_link"/);
  assert.match(main,/UPDATE pantry SET item=\?,brand=\?,retailer=\?,product_link=\?/);
});
test('Shopping cart groups eligible items and excludes discontinued records',()=>{
  assert.match(main,/function ShoppingHub/);
  assert.match(main,/COALESCE\(p\.discontinued,0\)=0/);
  assert.match(main,/Out of Stock/);
  assert.match(main,/Order Soon/);
  assert.match(main,/Retailer not specified/);
});
test('Shopping cards use image fallback and product links',()=>{
  assert.match(main,/function ShoppingProductCard/);
  assert.match(main,/product_image_url/);
  assert.match(main,/onError=\{\(\)=>setImageFailed\(true\)\}/);
  assert.match(main,/Open .* product page/);
});
test('Schema contains shopping link fields and current release metadata',()=>{
  assert.match(db,/product_link:'TEXT'/);
  assert.match(db,/product_image_url:'TEXT'/);
  assert.match(db,/1\.4\.15\.36/);
  assert.match(db,/schema_version,title,created_at\)\n\s*VALUES \('1\.4\.15\.36','2026-07-29','141536',81/);
});
