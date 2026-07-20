# Nutrient Data Contract

The machine-readable authority is `src/nutrition/registry.js`. Every ingestion, editing, snapshot, projection, dashboard, contributor, and recommendation path must use the canonical keys and units defined there.

Rules:

1. `null` means unknown. Numeric `0` means a verified zero.
2. Food values are stored per the food's `default_serving` and `unit`.
3. Meal and planned-meal rows are immutable nutrition snapshots scaled to the logged amount, except when the user explicitly corrects the source food and chooses the editor's refresh behavior.
4. All AI and restaurant records must preserve LDL-relevant nutrients: total fat, saturated fat, trans fat, cholesterol, fiber, calories, and sodium. Unknown values remain null.
5. Every value may carry source, confidence, and per-nutrient completeness metadata.
6. Net carbohydrates are derived as `max(0, carbohydrates - fiber)` and are not stored independently.

Tracked nutrients: calories, protein, carbohydrates, fiber, total fat, saturated fat, trans fat, cholesterol, sodium, potassium, total sugar, added sugar, monounsaturated fat, polyunsaturated fat, omega-3, calcium, iron, magnesium, vitamin D, vitamin C, alcohol, and caffeine.
