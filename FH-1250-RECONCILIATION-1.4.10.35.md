# FH-1250 Reconciliation — v1.4.10.35

## Scope implemented

- Renamed the meal workspace from Food / Meal Log to Meals.
- Confirmed What Should I Eat is a standalone Food Intelligence route owned by Meals.
- Removed What Should I Eat, Eat Next, Chef’s Recommendations, and Waste Risk from Pantry.
- Refocused Pantry on inventory control: In Stock, Restock, Out of Stock, Shopping, location filtering, search, and item editing.
- Reworked recipe snapshots to aggregate every registered nutrient, including caffeine and micronutrients.
- Ensured consumed and planned recipe records receive the complete nutrient snapshot.
- Added recalculation of current linked recipe meals when an ingredient food is enriched.
- Repaired enrichment-review feedback with a busy state, sticky success/error status, and readable evidence-object formatting.
- Preserved all-or-nothing enrichment transactions and current-day linked meal recalculation.

## Verification

- 204 automated tests passed.
- Release metadata verification passed.
- Production build was attempted but could not start because Vite is not installed in this sandbox and dependency installation was unavailable.

## Changed files

- src/main.jsx
- src/styles.css
- src/decision/engine.js
- public/sw.js
- package.json
- package-lock.json
- VERSION.json
- index.html
- ReleaseNotes.md
- CHANGELOG.md
- RELEASE-REGISTER.md
- tests/v141022-corrective.test.js
- tests/v141035-release-blockers.test.js
