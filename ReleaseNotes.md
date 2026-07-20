# Fizz Health v1.4.10.15 — Nutrient Integrity Completion & Logging Reliability

Issued July 20, 2026. Schema 43. Build 141015.

- Audited v1.4.10.14 against the agreed nutrient-integrity scope.
- Fixed Add Food commit failure caused by mismatched SQL columns and values.
- Exposed the complete nutrient inspector/editor from the Food list.
- Expanded Log Once to all tracked nutrients.
- Added canonical nutrient normalization for universal photo meal captures.
- Added current application, release-date, build, schema, and release-history information under Settings → About.
- Unified planned meal card appearance and swipe behavior with consumed meal cards.
- Preserved and documented the time-sensitive nutrient ranking and color logic.
# Fizz Health v1.4.10.14 — Nutrient Integrity and Decision Priority

- Added a canonical registry for every tracked nutrient and unit.
- Expanded food nutrition inspection and editing to the full nutrient set.
- Preserved unknown nutrient values as unknown instead of silently converting them to zero.
- Added nutrition source, confidence, completeness, and trans-fat database support.
- Refreshes matching consumed and planned nutrition snapshots after an explicit food correction.
- Preserved the prior late-day urgency logic and compounded it with time-of-day pace and recoverability.
- Goal-critical nutrients remain visible in the Top 10 without being pinned to fixed ranks.
- Progress-bar colors now use the same time-sensitive status produced by the ranking engine.
- Added persistent ADRs, algorithm documentation, data contract, pipeline documentation, and traceability.

# Fizz Health v1.4.10.13 — FH-1250.2 Corrective Nutrition Trust and Planner UX

This corrective release keeps FH-1250 open while repairing the interactive planning and nutrition-decision experience.

## Changes

- Reduced oversized Chef recommendation cards and repaired clipped/obscured recommendation text.
- Added swipe-right Consume and swipe-left Remove behavior to planned-meal cards, while retaining visible buttons.
- Replaced the raw ISO scheduling prompt with native date and time controls, quick Today/Tomorrow choices, and meal-occasion selection.
- Pinned Calories, Protein, Saturated Fat, Fiber, Cholesterol, and Net Carbs into the Top 10 dashboard set.
- Added an explicit explanation of fixed versus dynamic nutrient ranking.
- Added largest-to-smallest nutrient contributor lists, color-coded for consumed versus planned foods.
- Expanded nutrition propagation to include cholesterol and the extended nutrient set.
- Added planned-meal nutrient columns in schema 41.

FH-1250 remains open pending Product Owner acceptance and remaining deferred scope.
