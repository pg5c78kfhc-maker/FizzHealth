# Fizz Health v1.4.15.10 — Pantry Inventory Model Cleanup

## Completed story

FH-1415.49

## Scope

- Removed the editable Package state boolean and all active application logic that depended on it.
- Derives open-package status from package counts and open-package remainder.
- Removed the manual Freshness selector and derives freshness from purchase/prepared and expiration/best-by dates.
- Added Discontinued, defaulting to false, and excluded discontinued inventory from Pantry, Chef, Menu, Shopping, and recommendation queries.
- Rebuilt the Pantry item editor as an iPhone-friendly property sheet with labels left and fields right.
- Displays canonical enriched serving size and servings per container.
- Uses canonical serving size when a serving is consumed and advances through open and unopened package inventory.
- Preserved existing inventory quantities, locations, dates, notes, and package values.

## Release identity

- Version: 1.4.15.10
- Build: 141510
- Deployment: FH-20260727-141510
- Schema: 71
- Issued: 2026-07-27
- Created: 2026-07-27T18:15:00-04:00
