# Fizz Health v1.4.15.12 Test Report

## Targeted corrective tests

Command:

`node --test tests/v1.4.15.12-cleanup.test.js`

Result: **5 passed, 0 failed**.

Verified by source-level automated tests:

1. Menu Chef's Picks uses an isolated `menu-chef-section` class and no longer shares the standalone Chef page's `chef-section` class.
2. A populated container unit alone no longer activates package validation, allowing quantity-only Pantry records to save.
3. Pantry validation errors render immediately beneath the sticky editor header.
4. Superseded v1.4.15.8 and v1.4.15.9 structural Menu patches were removed and one canonical layout block remains.
5. The canonical layout removes stack spacing and makes Chef media span the full card width.

## Project integrity

Command:

`node scripts/project-integrity.mjs`

Result: **Passed**.

Integrity now verifies one application tree, one package file, one isolated live Menu Chef component, one canonical Menu/Chef layout block, and absence of the retired shared class and superseded patch blocks.

## Release metadata

Command:

`node scripts/verify-release.mjs`

Result: **Passed** — v1.4.15.12 / FH-1415.52.

## Complete historical test suite

Command:

`npm test`

Result: **449 passed, 132 failed, 581 total**.

The failures are pre-existing historical assertions and broad repository tests that remain inconsistent with later releases. The new v1.4.15.12 targeted suite passed completely.

## Production build

Command:

`npm run build`

Result: **Not completed**. The supplied archive contains no installed `node_modules`, and the environment has no `vite` executable (`sh: 1: vite: not found`). No successful production-build claim is made.

## Verification limitation

The corrected source paths and CSS contract were tested statically. This environment could not launch the production bundle or perform a real iPhone Safari interaction test because dependencies were unavailable. Device acceptance remains required before accepting the release.
