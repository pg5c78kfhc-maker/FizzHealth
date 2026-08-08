
## v1.4.17.18 — Audio Hub & Audible Library Foundation
Date: August 8, 2026

### Completed
- FH-17118.1 through FH-17118.5 — Audio umbrella navigation, Podcasts relocation, schema-147 Audible catalog model, 50-title seed import, and Audible library/series/detail navigation.

### Verification
- Focused release and migration tests: see TEST-REPORT-1.4.17.18.md.
- Schema advances to 147.

## v1.4.17.17 — Compact Workout Exchange & Workout-Aware Maintenance
Date: August 8, 2026

### Completed
- FH-17117.1 through FH-17117.4 — Compact workout calorie exchange icons, full-width metadata below actions, and workout-aware maintenance intelligence without double counting.

### Verification
- Focused release regression: passed.
- Project integrity: passed.
- Schema remains 146.
# Fizz Health v1.4.15.86

## Canonical Nutrient Schema Reconciliation

Version: 1.4.15.86  
Build: 141586  
Deployment: FH-20260731-141586  
Date: July 31, 2026  
Schema: 96

### Completed

- Reconciled the full canonical nutrient contract across foods, consumed meals, planned meals, restaurant meals, meal definitions, and meal-component nutrition snapshots.
- Corrected the schema target and repair marker to version 96.
- Hardened existing Prepared Recipe food updates by writing only nutrient columns verified in the live table schema.

---

# Fizz Health v1.4.15.85

## Prepared Recipe Save & Footer Corrective

Version: 1.4.15.85  
Build: 141585  
Deployment: FH-20260731-141585  
Date: July 31, 2026

### Completed

- FH-1585.1 — Abort prepared Recipe creation when any tracked ingredient cannot be fully deducted.
- FH-1585.2 — Use the centralized inventory service for preparation validation and deduction with explicit ingredient-level failures.
- FH-1585.3 — Keep the Prepared Recipe form above the persistent footer and display save errors immediately below the header.
- FH-1585.4 — Render the Save checkmark as active except while saving.

### Verification

- Focused prepared-recipe and inventory tests: 11 passed.
- Full historical test sweep: 580 passed; 225 pre-existing historical failures; 0 new failures.
- Production build attempted; blocked because installed dependencies were absent (`vite: not found`).

---

# Fizz Health v1.4.11.15

## Restaurant-Aware Meal Planning Prototype

Version: 1.4.11.15  
Build: 141250  
Deployment: FH-20260723-141250  
Date: July 23, 2026

### Completed

- FH-1478 — Persistent date-specific Restaurant toggle synchronized with Home.
- FH-1479 — Automatic restaurant capacity reservation with the separate reserve button removed.
- FH-1480 — Independent Beverage and Snack slots plus the full saved Meal catalog.
- FH-1481 — Starred restaurant choices, multiple restaurant meals per day, and reservation replacement with actual nutrition.

Completed story: FH-1478 through FH-1481

---

# Fizz Health v1.4.11.14

## Meal Planning Calendar Prototype

Version: 1.4.11.14  
Build: 141240  
Deployment: FH-20260723-141240  
Date: July 23, 2026

### Completed

- FH-1475 — Added Meal categories: Appetizer, Side, Dessert, Beverage, and Condiment.
- FH-1476 — Replaced pantry-food plan generation with a date-based calendar prototype that selects exclusively from saved Meals.
- FH-1477 — Added locked calorie-capacity reservations, date-only scheduling, meal components, and proposed-meal integration with Today.

### Prototype boundaries

The planner establishes the calendar, category, reservation, and proposal lifecycle. Recommendation ranking and automatic combination intelligence will be refined through use.

## 1.4.11.37
- Build: 141137
- Deployment: FH-20260724-141137
- Scope: FH-1376 through FH-1383
- Theme: UI Stabilization & Archive Recovery

## 1.4.11.38
- Build: 141138
- Deployment: FH-20260724-141138
- Date: 2026-07-25
- Theme: Archive Restore Completion
- Stories: FH-1384–FH-1387

---

# Fizz Health v1.4.12.1

## Nutrition Landing Page Organization

Version: 1.4.12.1  
Build: 141201  
Deployment: FH-20260725-141201  
Date: July 25, 2026

### Completed

- FH-1412.1 through FH-1412.8 — Renamed Eat to Nutrition, added Eating and Manage cards, preserved existing form destinations, moved Log Once to the landing page, added Shopping, and retired the obsolete Upcoming Meals landing workflow.

### Verification

- Release metadata verification: passed.
- v1.4.12.1 regression tests: 5 passed.
- Full historical test sweep: executed; legacy tests that intentionally pin prior release labels and metadata remain incompatible with the new release.
- Production dependency installation/build: blocked by a temporary npm registry 503 response for `xlsx@0.18.5`; no source-code build error was observed because Vite could not be installed in this environment.
