import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');

test('promotion stores and checks durable source identity',()=>{
 assert.match(main,/source_type:sourceType,source_id:String\(sourceId\)/);
 assert.match(main,/COALESCE\(archived,0\)=0 AND source_type=\? AND source_id=\?/);
 assert.match(main,/already available in Meals/);
});

test('promote action is unavailable while an active sourced meal exists',()=>{
 assert.match(main,/promotedMeal\?<div className="promotion-status"/);
 assert.match(main,/Available in Meals/);
});

test('swipe delete is wired to persistent meal removal',()=>{
 assert.match(main,/onArchive=\{\(\)=>deleteMealDefinition\(m\)\}/);
 assert.match(main,/UPDATE meal_definitions SET archived=1,updated_at=\? WHERE meal_id=\?/);
 assert.match(main,/removed from Meals/);
});

test('schema migration adds source columns and backfills promoted meals',()=>{
 assert.match(db,/version:56,name:'meal_promotion_uniqueness_and_deletion'/);
 assert.match(db,/ALTER TABLE meal_definitions ADD COLUMN source_type TEXT/);
 assert.match(db,/ALTER TABLE meal_definitions ADD COLUMN source_id TEXT/);
 assert.match(db,/notes LIKE 'Promoted from %'/);
});
