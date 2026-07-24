# Fizz Health v1.4.11.24 — Narration Navigation & Classified Meal Promotion

## FH-1322 — What Changed First
Daily Brief narration now leads with the newest meal-state or health changes, then summarizes the current situation and longer-running context.

## FH-1323 — Narration Transport Controls
Added 15-second rewind and advance controls to the spoken Daily Brief. Seeking preserves the selected voice and speed.

## FH-1324 — Resume Playback
The spoken brief records its approximate word position and resumes from that point after interruption or navigation. Restart remains available.

## FH-1325 — Food Consumption Roles
Foods can be classified as Standalone Food, Meal Component, or Both. Component-only items remain available to meals and recipes but are excluded from standalone pantry recommendations.

## FH-1326 / FH-1327 — Classified Meal Promotion
Foods and recipes can be promoted to Meals. Promotion requires a Meal Category, defaults explicitly to Any, and creates the Meal only after the categorized promotion is confirmed.

## Database
Schema 55 adds food consumption roles and source linkage for promoted Meal definitions.

Completed scope: FH-1322 through FH-1327.
