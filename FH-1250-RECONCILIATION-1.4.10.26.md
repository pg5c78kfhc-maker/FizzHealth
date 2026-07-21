# Fizz Health v1.4.10.26 Reconciliation

## Assigned scope

**FH-1250.25 — Recipe Creation Discoverability**

## Implemented

- The Recipes view now presents **New Recipe** as its primary creation action.
- Added a keyboard-safe recipe editor with fixed close and save controls.
- Added recipe name entry and repeatable ingredient rows.
- Ingredients are selected from active Foods and store linked food IDs, quantities, and units.
- Added validation for blank names, missing foods, invalid quantities, repeated ingredients, and duplicate active recipe names.
- Successful saves return to the Recipes view and refresh the recipe list immediately.
- Existing food creation, Log Once, recipe logging, proposed-meal behavior, and restaurant workflows were not changed.

## Release identity

- Version: **1.4.10.26**
- Build: **141026**
- Story: **FH-1250.25**

## Verification

- Automated tests: **187 passed, 0 failed**
- Release metadata verification: **passed**
- Production build: **passed**
- Build warning: the existing primary JavaScript chunk remains above Vite's 500 kB advisory threshold; this did not prevent production compilation.
