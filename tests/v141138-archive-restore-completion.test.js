import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('src/main.jsx','utf8');
const styles=fs.readFileSync('src/styles.css','utf8');
const version=JSON.parse(fs.readFileSync('VERSION.json','utf8'));

test('archived swipe is restore-first and never log-first',()=>{
  assert.match(main,/function SwipeArchiveCard\(\{children,onOpen,onArchive,onQuickLog,onFullSwipe,onRestore,label,archived=false\}\)/);
  assert.match(main,/archived\?`Restore \$\{label\} to Active`:`Add \$\{label\} to Food Log`/);
  assert.match(main,/archived\?\(commitReady\?'Release to restore':'Restore'\)/);
  assert.match(main,/archived\?restore\(\):onFullSwipe/);
});

test('recipe list queries preserve archived state',()=>{
  assert.match(main,/MAX\(COALESCE\(archived,0\)\) archived/);
  assert.match(main,/MAX\(COALESCE\(r\.archived,0\)\) archived/);
  assert.match(main,/archived=\{archived\} onRestore=\{\(\)=>restoreRecipe\(r\)\}/);
});

test('archived Food and Recipe details expose visible restore controls',()=>{
  assert.match(main,/className="archive-status-banner"/);
  assert.match(main,/Restore to Active/);
  assert.match(main,/restore-icon-action/);
  assert.match(styles,/\.archive-status-banner/);
});

test('restore persists timestamp and clears archive state',()=>{
  assert.match(main,/UPDATE foods SET archived=0,archived_at=NULL,restored_at=\?,archive_source=NULL/);
  assert.match(main,/UPDATE recipes SET archived=0,archived_at=NULL,restored_at=\?,archive_source=NULL/);
});

test('release metadata is v1.4.11.38',()=>{
  assert.equal(version.version,'1.4.11.38');
  assert.equal(version.build,'141138');
  assert.equal(version.completed_story,'FH-1387');
  assert.match(main,/const VERSION='1\.4\.11\.38'/);
});
