import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUDIBLE_SEED_BOOKS,AUDIBLE_SEED_SQL} from '../src/audio/audibleSeed.js';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const db=fs.readFileSync(new URL('../src/database.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const meta=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('release metadata advances to v1.4.17.18 and schema 147',()=>{
  assert.equal(pkg.version,'1.4.17.18');
  assert.equal(meta.version,'1.4.17.18');
  assert.equal(meta.schema_version,147);
  assert.match(main,/const VERSION='1\.4\.17\.18'/);
  assert.match(main,/const BUILD_ID='141718'/);
  assert.match(db,/const TARGET_SCHEMA_VERSION=147/);
  assert.match(db,/version:147,name:'Audio Hub and Audible Library Foundation'/);
});

test('footer is Audio with headphones and Podcasts is nested under Audio',()=>{
  assert.match(main,/\{id:'audio',I:Headphones,label:'Audio'\}/);
  assert.doesNotMatch(main,/\{id:'podcasts',I:Podcast,label:'Podcasts'\}.*navItems/);
  assert.match(main,/audioTabs=new Set\(\['audio','podcasts','audible'\]\)/);
  assert.match(main,/tab==='audio'.*<AudioHub/s);
  assert.match(main,/tab==='podcasts'.*<PodcastsPage onBack=\{\(\)=>visit\('audio'\)\}/s);
  assert.match(main,/className="audio-destination-card podcast-destination".*<Podcast\/>/s);
});

test('schema 147 models audiobooks, series, creators, ownership, listening state, and artwork',()=>{
  for(const table of ['audible_series','audible_authors','audible_narrators','audible_audiobooks','audible_audiobook_authors','audible_audiobook_narrators'])assert.match(db,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  for(const field of ['audible_asin','cover_image_url','series_id','series_position','ownership_status','owned_in_audible','audible_progress_text','remaining_minutes','listening_status','discovered_from_series'])assert.match(db,new RegExp(field));
  assert.match(db,/\$\{AUDIBLE_SEED_SQL\}/);
});

test('first Audible seed contains 50 source-faithful owned titles and series structure',()=>{
  assert.equal(AUDIBLE_SEED_BOOKS.length,50);
  assert.equal(new Set(AUDIBLE_SEED_BOOKS.map(book=>book.asin)).size,50);
  assert.equal(new Set(AUDIBLE_SEED_BOOKS.filter(book=>book.series_id).map(book=>book.series_id)).size,12);
  const missing=AUDIBLE_SEED_BOOKS.find(book=>book.asin==='B0FKBYGP5L');
  assert.equal(missing?.title,'The Missing: Police Scotland Crime Series, Book 9');
  assert.equal(missing?.series_name,'Police Scotland Crime Series');
  assert.equal(missing?.series_position,9);
  assert.equal(missing?.product_url,'https://www.audible.com/pd/The-Missing-Audiobook/B0FKBYGP5L');
  const murder=AUDIBLE_SEED_BOOKS.find(book=>book.title.startsWith('Murder of Crows'));
  assert.equal(murder?.remaining_minutes,537);
  assert.equal(murder?.listening_status,'in_progress');
  const ambiguous=AUDIBLE_SEED_BOOKS.find(book=>book.title==='What She Saw');
  assert.equal(ambiguous?.runtime_minutes,null);
  assert.equal(ambiguous?.progress_text,'<1 min');
  assert.ok(AUDIBLE_SEED_BOOKS.every(book=>book.cover_image_url===undefined),'seed should not fabricate cover URLs absent from the capture');
  assert.match(AUDIBLE_SEED_SQL,/ownership_status.*'owned'/s);
});

test('Audible pages expose Library, Series, details, ownership, placeholders and deep links',()=>{
  for(const token of ['function AudioHub','function AudiblePage','Audible Library','role="tab"','>Library<','>Series<','Book Details','Open in Audible','audible-product']){
    if(token==='audible-product')continue;
    assert.ok(main.includes(token),`${token} missing`);
  }
  assert.match(main,/href=\{book\.audible_product_url\}/);
  assert.match(main,/href=\{selectedBook\.audible_product_url\}/);
  assert.match(main,/AudibleOwnershipBadge/);
  assert.match(main,/audible-cover-placeholder/);
  assert.match(styles,/\.audible-cover-placeholder/);
  assert.match(styles,/\.audible-series-card/);
});
