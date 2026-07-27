import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles.css','utf8');
const meta=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('v1.4.14.4B release identity is current',()=>{
 assert.equal(meta.version,'1.4.14.4B');
 assert.equal(meta.build,'141404B');
 assert.equal(meta.schema_version,66);
});

test('category picker uses canonical Fizz categories only',()=>{
 assert.match(main,/const canonicalCategoryNames=\[\.\.\.MEAL_CATEGORIES\]/);
 assert.doesNotMatch(main,/universalCategoryNames/);
 assert.doesNotMatch(main,/New category…/);
 assert.match(main,/No Classification/);
});

test('restaurant reclassification preserves source section',()=>{
 assert.match(main,/UPDATE restaurant_meals SET primary_category=\?,eligible_categories_json=\?,updated_at=\?/);
 assert.doesNotMatch(main,/UPDATE restaurant_meals SET category=\?,updated_at=\?/);
});

test('all supported objects may be explicitly unclassified',()=>{
 assert.match(main,/UPDATE foods SET category=\?,updated_at=\?/);
 assert.match(main,/UPDATE recipes SET category=\?/);
 assert.match(main,/UPDATE meal_definitions SET category=\?,updated_at=\?/);
 assert.match(main,/chosen\|\|null/);
});

test('collapsible category headers have explicit visual hierarchy',()=>{
 assert.match(css,/v1\.4\.14\.4B/);
 assert.match(css,/font-weight:900!important/);
 assert.match(css,/menu-category-heading\[aria-expanded="true"\]/);
 assert.match(main,/section\.items\.length[\s\S]*ChevronUp/);
});
