# Fizz Health v1.4.15.47 Test Report

## Scope tested

- Completed the Food Record Shopping tab.
- Moved preferred retailer, product link, barcode/scanner, and last price into Shopping.
- Removed those shopping-owned fields from the Inventory tab display and editor.
- Verified label-left/value-right Shopping layouts.
- Preserved Pantry and food-barcode persistence paths.
- Preserved the accepted v1.4.15.46 mobile Inventory layout corrective.

## Results

- `node --test tests/release-1.4.15.47.test.js`: **PASS — 4/4**
- `node scripts/project-integrity.mjs`: **PASS**
- `node scripts/verify-release.mjs`: **PASS**
- Focused legacy shopping/barcode regression assertions: **17 passed**; 6 release-specific historical assertions failed because they require older version numbers or retired labels.

## Build status

The production Vite build could not be executed because dependencies are not installed and the configured package registry returns HTTP 404 for `xlsx@0.18.5`. The source archive contains no `node_modules` directory. This is an environment dependency-resolution limitation, not a reported application test failure.

## Release metadata

- Application version: 1.4.15.47
- Issued date: 2026-07-29
- Build identifier: 141547
- Deployment identifier: FH-20260729-141547
- Created timestamp: 2026-07-29T16:55:00-04:00
- Schema version: 82
