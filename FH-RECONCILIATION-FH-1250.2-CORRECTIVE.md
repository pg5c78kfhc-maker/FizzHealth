# FH-1250.2 Corrective Reconciliation — v1.4.10.13

## Implemented

- Recommendation cards compacted; meal title and explanation text remain visible.
- Planned meals now support swipe right to consume and swipe left to remove, with visible button fallbacks.
- Removed planned meals continue to create the existing same-day suppression event and immediately leave projected totals.
- Scheduling now uses native date and time controls, Today/Tomorrow shortcuts, and Breakfast/Lunch/Dinner/Snack occasion selection.
- Top 10 nutrient ranking now guarantees Calories, Protein, Saturated Fat, Fiber, Cholesterol, and Net Carbs remain visible.
- Nutrient detail displays the ranking rationale.
- Nutrient detail lists consumed and planned contributors from largest to smallest with matching status colors.
- Nutrition scaling now carries the extended nutrient set, including cholesterol.
- Schema 41 adds extended nutrient columns to planned meals.

## Testing

- Automated tests: 178 passed, 0 failed.
- Release verification: passed.
- Production build: passed.

## Status

FH-1250 remains OPEN pending Product Owner acceptance and completion of deferred FH-1250 scope. Consolidated PMO update remains deferred until FH-1250 is completed.
