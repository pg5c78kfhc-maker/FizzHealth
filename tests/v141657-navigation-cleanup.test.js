import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('release version is 1.4.16.57',()=>{assert.equal(pkg.version,'1.4.16.57');assert.match(main,/const VERSION='1\.4\.16\.57'/)});
test('primary footer includes Podcasts between Health and Settings',()=>{assert.match(main,/Health'\},\{id:'podcasts'.*Podcasts'\},\{id:'data'.*Settings'/s)});
test('podcasts renders as a first-class app tab',()=>{assert.match(main,/tab==='podcasts'.*<PodcastsPage/s)});
test('settings hub no longer lists Podcasts',()=>{const data=main.slice(main.indexOf('function Data('),main.indexOf('function AboutPage'));assert.doesNotMatch(data,/\['podcasts',Podcast/)});
test('expandable footer supports drag, tap and session persistence',()=>{assert.match(main,/function ExpandableBottomNav/);assert.match(main,/sessionStorage\.getItem\('fizz-footer-expanded'\)/);assert.match(main,/onTouchStart=\{start\}/);assert.match(main,/suppressToggle\.current/);assert.match(main,/commit\(!expanded\)/);assert.match(css,/\.footer-secondary-grid/)});
test('played disclosure renders a dedicated shared-card region',()=>{assert.match(main,/podcast-played-expanded/);assert.match(main,/data-played-count=\{playedRows\.length\}/);assert.match(main,/renderRows\(playedRows,active\.length\)/)});
test('schema 136 removes only unreferenced obsolete meal classifications',()=>{assert.match(db,/TARGET_SCHEMA_VERSION=136/);assert.match(db,/version:136/);assert.match(db,/LOWER\(TRIM\(COALESCE\(md\.classification,''\)\)\)='meal'/);assert.match(db,/NOT EXISTS \(SELECT 1 FROM meals/);assert.match(db,/NOT EXISTS \(SELECT 1 FROM planned_meals/);assert.match(db,/DELETE FROM meal_components/);assert.match(db,/DELETE FROM meal_definitions/)});
