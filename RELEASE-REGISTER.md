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
