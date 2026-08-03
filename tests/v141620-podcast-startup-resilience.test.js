import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const source=fs.readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
test("release version is 1.4.16.20",()=>assert.match(source,/const VERSION='1\.4\.16\.20'/));
test("podcast error boundary uses module-scope self-contained header",()=>{assert.match(source,/function PodcastPageHeader\(/);assert.match(source,/class PodcastPageBoundary[\s\S]*<PodcastPageHeader title="Podcasts"/);assert.doesNotMatch(source,/class PodcastPageBoundary[\s\S]{0,1500}<Head /)});
test("saved section state is validated before use",()=>{assert.match(source,/function safePodcastSectionState\(\)/);assert.match(source,/useState\(safePodcastSectionState\)/)});
test("My Podcasts startup reads are migration-safe",()=>{assert.match(source,/allPodcastRecords=optionalQuery/);assert.match(source,/const upNext=optionalQuery/);assert.match(source,/const stories=optionalQuery/);assert.match(source,/drama=optionalQuery/);assert.match(source,/subscriptionRows=optionalQuery/)});
test("local podcast header delegates to shared header",()=>assert.match(source,/const Head=\(\{title,right,onClose\}\)=><PodcastPageHeader/));
