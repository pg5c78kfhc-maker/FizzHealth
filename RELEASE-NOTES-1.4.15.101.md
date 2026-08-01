# Fizz Health v1.4.15.101 — Scaled Laboratory Range Visualization

Issued: August 1, 2026  
Baseline: Fizz Health v1.4.15.100

## Included

- Corrected laboratory range evaluation so missing bounds remain null instead of becoming zero.
- Added direct support for `<`, `<=`, `>`, and `>=` comparison operators plus bounded ranges.
- Corrected HDL 58 mg/dL and both eGFR results to evaluate as in range against their minimum-only Quest ranges.
- Added proportional horizontal laboratory progress bars with measured-value markers.
- Bars use a linear numeric domain; threshold and measured-value positions are calculated from the same scale.
- Added upper-limit, lower-limit, and bounded-range rendering.
- Kept value cards in a consistent right-hand column containing result and unit only.
- Moved the stored reference range into the left information stack above the progress bar.
- Changed the Health landing Labs card from “32 biomarkers” to “32 / Labs”.
- Updated release, schema, engine, package, and service-worker metadata to v1.4.15.101.

## Status behavior for July 8, 2026

Out of range: Total Cholesterol, LDL Cholesterol, Non-HDL Cholesterol.

In range: HDL Cholesterol and all other reported numeric Quest results.

Unavailable: BUN/Creatinine Ratio, which remains Not Reported.

## Out of scope

No Nutrition, Daily Brief, Inventory, Pantry, Shopping, Recipe, Meal Planner, Chef’s Picks, medical scoring, or new laboratory import work was included.
