# ADR-001 — Unknown nutrient values are not zero

## Decision
Persist missing nutrient values as `null`. Display them as Unknown. Store zero only when the source explicitly verifies zero.

## Why
Converting missing cholesterol or saturated fat to zero creates false reassurance and corrupts LDL guidance, totals, recommendations, and contributor analysis.

## Consequences
Aggregation and UI code must track completeness separately from arithmetic totals. AI imports may not invent absent values.

## Related implementation
`src/nutrition/registry.js`, database migration 42, NutritionEditor, nutrient contributor views.
