import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('Labs bars label exact color transition thresholds',()=>{assert.match(main,/lab-threshold-marker/);assert.match(main,/thresholds=\[range\?\.low,range\?\.high\]/);assert.match(css,/\.lab-threshold-marker/)});
test('recommendations exclude consumed and proposed foods',()=>{assert.match(main,/consumedOrProposed/);assert.match(main,/FROM meals WHERE consumed_local_date=\?/);assert.match(main,/FROM planned_meals WHERE planned_local_date=\? AND status='planned'/)});
test('recommendations use category diversity and rotation',()=>{assert.match(main,/balancedRecommendations/);assert.match(main,/recommendationCategory/);assert.match(main,/recentRecommendations/);assert.match(main,/recommendationProtein/)});
test('recommendations use latest stored laboratory results without blanket exclusion',()=>{assert.match(main,/latestLabContext/);assert.match(main,/labAwareRecommendationAdjustment/);assert.match(main,/frequency and rotation|recommendation rotation/i)});
