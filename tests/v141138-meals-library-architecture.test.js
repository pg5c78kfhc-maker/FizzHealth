import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
test('release metadata is centralized at 1.4.11.38',()=>{
 assert.match(main,/const VERSION='1\.4\.11\.38'/);
 assert.match(main,/const BUILD_ID='141138'/);
 assert.match(db,/TARGET_SCHEMA_VERSION=59/);
});
test('Meals library exposes entity modes, scope icons, and one create menu',()=>{
 for(const token of ['library-mode-tabs','Ingredients','Recipes','Meals','library-scope-tabs','aria-label="All"','aria-label="Recent"','aria-label="Favorites"','create-menu','Log Once','New Ingredient','New Recipe','New Meal']) assert.ok(main.includes(token),token);
 assert.doesNotMatch(main,/What Should I Eat\?/);
});
test('unified cards reserve a vertical edit and favorite rail',()=>{
 assert.ok(main.includes('unified-library-card'));
 assert.ok(main.includes('library-card-actions'));
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) 54px/);
 assert.match(css,/flex-direction:column/);
});
test('data enrichment moved under Settings',()=>{
 assert.ok(main.includes('function DataEnrichmentPage'));
 assert.ok(main.includes("['enrichment',Sparkles,'Data Enrichment'"));
 assert.ok(main.includes('Needs Nutrients'));
});
test('meal favorites persist in schema migration 59',()=>{
 assert.match(db,/CREATE TABLE IF NOT EXISTS favorite_meals/);
 assert.match(main,/toggleMealFavorite/);
});
