# Fizz Health v1.4.17.7 — Nutrition Landing Regression Hotfix

## Release title
Nutrition Landing Regression Hotfix

## Implemented scope
- Restored the missing `FoodHub` Nutrition landing component used by the permanent Nutrition footer tab.
- Preserved the current Nutrition landing actions: Menu, Log Once, Library, and Restaurants.
- Added an ErrorBoundary around the Nutrition route for runtime containment.
- Added focused regression coverage for the Nutrition footer route and hotfix metadata.

## User-facing behavior
Tapping Nutrition in the footer once again opens the Nutrition landing page instead of a black screen. No workout-planning, podcast, health, or database behavior was changed.

## Migration notes
No database migration. Schema version remains 142. Existing workout-history import data and all prior application data are unchanged.

## Known limitations
The sandbox package registry does not provide the pinned `xlsx@0.18.5` tarball, so dependencies cannot be installed and the Vite production build cannot be completed in this environment. See the Test Report for the exact error.
