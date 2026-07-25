import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('v1.4.11.42 metadata is centralized',()=>{
  assert.equal(pkg.version,'1.4.11.42');
  assert.equal(meta.version,'1.4.11.42');
  assert.equal(meta.build,'141142');
  assert.equal(meta.schema_version,63);
  assert.match(main,/const VERSION='1\.4\.11\.42'/);
  assert.match(main,/const BUILD_ID='141142'/);
  assert.match(main,/const DEPLOYMENT_ID='FH-20260725-141142'/);
});

test('create button occupies the right header column without a size change',()=>{
  assert.match(css,/\.create-menu-wrap\{position:relative;grid-column:3;justify-self:end\}/);
  assert.match(css,/\.food-library-page \.meals-library-head>button,\.food-library-page \.create-menu-wrap>button\{width:44px;height:44px;min-width:44px/);
});

test('primary mode and secondary filter share one selected background',()=>{
  assert.match(css,/\.library-mode-switch button\.active svg\{background:#3f563d/);
  assert.match(css,/\.library-scope-row button\.active\{color:#b8ff62;background:#3f563d/);
});

test('context-aware search and all three modes remain intact',()=>{
  assert.match(main,/placeholder=\{`Search \$\{view\}…`\}/);
  assert.match(main,/\['ingredients',Apple,'Ingredients'\]/);
  assert.match(main,/\['recipes',BookOpen,'Recipes'\]/);
  assert.match(main,/\['meals',UtensilsCrossed,'Meals'\]/);
});

test('library card geometry remains at the approved v1.4.11.41 values',()=>{
  assert.match(css,/\.food-library-page \.item\.select\{min-height:112px;display:grid;grid-template-columns:minmax\(0,1fr\) 54px;align-items:start;gap:10px;padding:16px 12px 16px 18px;border-radius:18px\}/);
  assert.match(css,/\.food-library-page \.vertical-card-actions button\{width:44px;height:44px;min-width:44px;border-radius:50%/);
});
