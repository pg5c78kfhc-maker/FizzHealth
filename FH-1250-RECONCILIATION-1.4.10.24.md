# Fizz Health v1.4.10.24 — Restaurant Tile Hotfix

## Defect
Opening **Food → Restaurants** immediately triggered the Restaurants error boundary, preventing access to the restaurant list and all restaurant-release testing.

## Root cause
The Restaurants component called `getTodayTotals()` during initialization, but that helper did not exist in v1.4.10.23. The resulting JavaScript `ReferenceError` occurred before the restaurant list rendered.

## Correction
- Added `getTodayTotals(date)` using the canonical `meals` table.
- Included calories, protein, carbohydrates, fiber, fat, saturated fat, and sodium.
- Added safe zero defaults if the optional query cannot return a row.
- Preserved the existing Food hub → Restaurants route and restaurant workflows.
- Added regression tests for the helper and route.

## Release identity
- Version: 1.4.10.24
- Build: 141024
- Schema: 44 (unchanged)
- Release type: immediate patch

## Verification
- 179 automated tests passed.
- Release metadata verification passed.
- Production Vite build passed.
