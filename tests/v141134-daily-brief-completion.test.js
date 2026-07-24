import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Daily Brief leads with newest-first event intelligence',()=>{
 assert.match(main,/JUST IN · NEWEST FIRST/);
 assert.match(main,/What changed most recently/);
 assert.match(main,/ORDER BY eaten_at DESC LIMIT 8/);
 assert.match(main,/Meal logged/);
});

test('spoken brief provides working fifteen-second transport',()=>{
 assert.match(main,/function narrationChunks/);
 assert.match(main,/aria-label="Go back 15 seconds"/);
 assert.match(main,/aria-label="Advance 15 seconds"/);
 assert.match(main,/skipSpeech\(-1\)/);
 assert.match(main,/skipSpeech\(1\)/);
});

test('spoken brief persists and resumes its position',()=>{
 assert.match(main,/fizz-brief-position-/);
 assert.match(main,/localStorage\.setItem\(`fizz-brief-position-/);
 assert.match(main,/localStorage\.getItem\(`fizz-brief-position-/);
});

test('brief ends with a direct next action',()=>{
 assert.match(main,/WHAT SHOULD I DO NEXT\?/);
 assert.match(main,/Do this now/);
 assert.match(css,/Daily Brief completion/);
});
