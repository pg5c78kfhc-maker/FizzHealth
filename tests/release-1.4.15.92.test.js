import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const version=JSON.parse(fs.readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));

test('Daily Brief uses the full structured topic model',()=>{
 const titles=['Executive Summary','Today’s Weight','What Changed Since Your Last Update?','Why Your Health Is Changing','What Should I Do Next?',"Today’s Nutrition Outlook","Today’s Activity Outlook",'Biomarker Update','Health Score','Current Risk Indicators','Trend Confidence','Longitudinal Insights','Pantry & Prepared Foods','Upcoming Expirations','Shopping Priorities',"Chef’s Intelligence",'Health Opportunities','Health Risks','Wins & Milestones','Looking Ahead','Monitoring Status','Data Quality','Closing Summary'];
 for(const title of titles)assert.match(main,new RegExp(title.replace(/[?]/g,'\\?')));
 assert.match(main,/function BriefingSection/);
 assert.match(main,/briefing-headlines/);
 assert.match(main,/Coming up, your update will include these topics/);
});

test('spoken and visual briefs share the same sections',()=>{
 assert.match(main,/sections\.flatMap\(section=>\[section\.title,section\.headline/);
 assert.match(main,/sections\.map\(\(section,index\)=>/);
 assert.match(main,/narrationChunks\(narration/);
});

test('Health page removes intelligence cards and uses standard header',()=>{
 const healthStart=main.indexOf('function Health({');
 const healthEnd=main.indexOf('function PersonalHealthProfile',healthStart);
 const health=main.slice(healthStart,healthEnd);
 assert.doesNotMatch(health,/health-intelligence-v2/);
 assert.doesNotMatch(health,/Meaningful relationships/);
 assert.match(health,/standard-form-header health-standard-header/);
 assert.match(health,/aria-label="Close Health"/);
});

test('newspaper headline presentation is collapsed and styled',()=>{
 assert.match(main,/<details className="briefing-section"/);
 assert.match(styles,/\.briefing-section>summary h2/);
 assert.match(styles,/font-family:Georgia/);
});

test('release metadata is consistently version 1.4.15.92',()=>{
 assert.equal(version.version,'1.4.15.92');
 assert.equal(version.build,'141592');
 assert.equal(version.deployment_id,'FH-20260801-141592');
 assert.match(main,/const VERSION='1\.4\.15\.92'/);
});
