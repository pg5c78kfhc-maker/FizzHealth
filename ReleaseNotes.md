# Fizz Health v1.4.15.59 — Recipe Record Navigation Corrective

Build: 141559  
Deployment: FH-20260730-141559

## Delivered

- **FH-1559.1:** Route every Library Recipe tap directly to the modern Recipe record with General, Nutrition, Inventory, and Ingredients tabs.
- **FH-1559.2:** Separate Food and Recipe presentation dispatch so the legacy shared Recipe rendering path cannot intercept Recipe navigation.
- **FH-1559.3:** Preserve the complete v1.4.15.58 Recipe migration, schema version 85, historical records, and data architecture unchanged.

Baseline: **FH-1558.9**.

## Boundaries

- No database table or data-layer renames.
- No additional migration or schema changes.
- No Meal Planner, consumed-log, recommendation, or unrelated Library redesign.
