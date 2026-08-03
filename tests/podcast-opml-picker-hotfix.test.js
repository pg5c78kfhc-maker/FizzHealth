import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/main.jsx', import.meta.url),'utf8');

test('OPML picker does not use an iOS-blocking accept filter',()=>{
  const marker='ref={opmlInputRef} type="file"';
  const start=source.indexOf(marker);
  assert.notEqual(start,-1,'OPML file input exists');
  const input=source.slice(start,source.indexOf('/>',start)+2);
  assert.equal(input.includes('accept='),false,'OPML input permits selection before content validation');
  assert.match(input,/onChange=\{event=>importOpmlFile\(event\.target\.files\?\.\[0\]\)\}/);
});

test('OPML content is still parsed and validated after selection',()=>{
  assert.match(source,/parsePodcastOpml\(await file\.text\(\)\)/);
});
