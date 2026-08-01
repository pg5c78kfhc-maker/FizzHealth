# Daily Brief Architecture — v1.4.15.92

## Shared briefing model

`DecisionBrief` creates one ordered `sections` collection. Every section contains:

- stable section ID;
- topic title;
- current newspaper-style headline;
- full explanatory paragraphs;
- optional detail items;
- optional navigation action.

The visual page maps that collection through `BriefingSection`. The speech narration flattens the same collection in the same order. No separate spoken-content list is maintained.

## Topic order

1. Executive Summary
2. Today’s Weight
3. What Changed Since Your Last Update?
4. Why Your Health Is Changing
5. What Should I Do Next?
6. Today’s Nutrition Outlook
7. Today’s Activity Outlook
8. Biomarker Update
9. Health Score
10. Current Risk Indicators
11. Trend Confidence
12. Longitudinal Insights
13. Pantry & Prepared Foods
14. Upcoming Expirations
15. Shopping Priorities
16. Chef’s Intelligence
17. Health Opportunities
18. Health Risks
19. Wins & Milestones
20. Looking Ahead
21. Monitoring Status
22. Data Quality
23. Closing Summary

## On-screen behavior

- Only section label and meaningful headline are visible initially.
- Each topic uses a native collapsed `<details>` disclosure.
- Expanding a topic reveals its complete briefing text and any action.
- The first meaningful sections may display an `UPDATED` badge when current events exist.
- A topic index appears before the briefing sections.

## Spoken behavior

The narration begins:

> Hello Edward, here’s your latest health and nutrition update as of [date/time].

It then announces every topic and reads every section title, headline, paragraph, and detail item in order. Existing play, pause, restart, stop, and 15-second skip controls remain.

## Health-page consolidation

Removed from the Health page:

- Health Intelligence 2.0 overview;
- Longitudinal Coverage card;
- Biomarkers card;
- Meaningful Relationships card;
- Preventive Care card;
- raw coaching/correlation cards;
- biomarker trend strip;
- goal-intelligence cards;
- preventive-intelligence rows.

The underlying analytical builders remain available to the Daily Brief. Current readings, check-in completion, metric history, and the health/meal timeline remain on Health.

## Header standard

The Health root uses the standard three-column header:

- X at left;
- centered `HEALTH / Health` title;
- empty right-side placeholder to preserve centering;
- existing sticky safe-area behavior.
