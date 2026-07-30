# Fizz Health v1.4.15.56 Test Report

## Release
Inventory Model Consolidation & Nutrition Landing Cleanup

## Focused acceptance
**12/12 passed**

Verified:
- `Each` is available in the Inventory package-type picker.
- Servings per package is displayed and edited in Inventory, not Nutrition.
- Schema 84 adds Pantry-owned `servings_per_package` and migrates existing Food values.
- Packaged inventory uses quantity on hand × servings per package.
- Directly measured inventory uses compatible stored amount ÷ serving size.
- Food-card availability formatting remains intact.
- Inventory display/edit parity includes package, on-hand, storage, package size, sealed/open package, opened date, purchase date, best-by date, quality, and notes.
- Legacy Pantry and standalone Shopping landing cards/routes are removed.
- Manage uses the same two-column proportions as Eating.
- Nutrition appears once in the landing-page header.

## Integrity and release verification
- `npm run integrity:check`: **Passed**
- `npm run verify:release`: **Passed**
- Release identity: **v1.4.15.56 / build 141556 / schema 84**

## Full regression suite
- **513 passed / 208 failed**
- Baseline reported for v1.4.15.55: **515 passed / 206 inherited failures**
- Two additional legacy assertions conflict with this release’s explicitly approved removal/movement of old Pantry/Shopping entry points and Nutrition-owned package presentation. No focused acceptance failure was found.

## Production build
The build command reached `vite build` but could not execute because dependencies are not installed in the sandbox (`vite: not found`). Project integrity completed successfully before that limitation.

## Database and scope boundaries
- One schema migration added: Pantry `servings_per_package`.
- Existing Food `servings_per_container` values are copied into Pantry when available; historical Food values remain preserved for compatibility.
- No reorder-threshold or Shopping-eligibility changes.
- No Add Now workflow changes.
