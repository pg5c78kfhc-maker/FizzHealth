import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
const version=JSON.parse(fs.readFileSync(new URL("../VERSION.json",import.meta.url),"utf8"));

test("ChefRecommendations has one enclosing section and no stray fragment closure",()=>{
  const start=source.indexOf("function ChefRecommendations");
  const end=source.indexOf("function pantryUrgency",start);
  const block=source.slice(start,end);
  assert.match(block,/return <section className="chef-section">/);
  assert.doesNotMatch(block,/<\/>/);
  assert.match(block,/<\/section>\s*\n}/);
});

test("hotfix release metadata is 1.4.15.105",()=>{
  assert.equal(version.version,"1.4.15.105");
  assert.equal(version.build_id,"1415105");
  assert.equal(version.schema_version,105);
});
