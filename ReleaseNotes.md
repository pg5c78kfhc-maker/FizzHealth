# Fizz Health v1.4.15.11 — Pantry Serving Decrement Corrective

## Completed story

FH-1415.53

## Scope

- Converts logged servings into the canonical enriched serving size before decrementing Pantry inventory.
- Uses the enriched serving unit and converts it to the Pantry inventory unit when compatible.
- Synchronizes packages on hand, unopened packages, and open-package remainder as containers are opened and exhausted.
- Restores package structure when a Pantry-linked consumption event is undone.
- Adds an Include discontinued control so discontinued records can be reviewed and restored without returning to active recommendations.
- Removes remaining active Menu and Chef dependence on the obsolete stored package-state value.
- Carries serving size and servings per container into product-enrichment requests.
- Preserves the existing Pantry property-sheet editor and derived freshness behavior.
- Retains the carried-forward Menu editor routing and Chef layout corrections.

## Release identity

- Version: 1.4.15.11
- Build: 141511
- Deployment: FH-20260727-141511
- Schema: 72
- Issued: 2026-07-27
- Created: 2026-07-27T20:30:00-04:00
