# Fizz Health v1.4.15.46 Test Report

## Scope
Correct the embedded Food Record Inventory editor on iPhone so labels remain in the left column and editable values and controls remain in the right column.

## Implementation verification
- Added a Food Record Inventory-specific mobile override after the legacy v1.4.15.34 stacked-form rule.
- Preserved the legacy standalone Pantry editor behavior outside the Food Record.
- Right-aligned inputs, selects, outputs, checkboxes, product-link actions, and barcode actions within the value column.
- Updated centralized release metadata and package versions to v1.4.15.46.

## Automated tests
- `node --test tests/release-1.4.15.46.test.js`: PASS (2/2)
- `node scripts/project-integrity.mjs`: PASS

## Regression note
The prior v1.4.15.45 test file contains release-specific assertions requiring the active version to remain v1.4.15.45; that historical metadata assertion correctly fails after advancing to v1.4.15.46. Its five functional architecture assertions passed before the version-only assertion.

## Build
A production Vite build was not rerun because the supplied source archive does not contain `node_modules`, and the previous release environment documented unavailable registry dependencies. No JavaScript behavior or dependency changes were made in this corrective release.
