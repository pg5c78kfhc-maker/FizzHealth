# Fizz Health v1.4.15.10 Test Report

## Release-specific acceptance tests

Command:

`node --test tests/v141510-pantry-inventory-model-cleanup.test.js`

Result: **PASS — 5/5**

Verified:

- Package State and manual Freshness controls are absent from the Pantry editor.
- Freshness is derived from recorded dates.
- Discontinued is persisted and excluded from active inventory/intelligence queries.
- Serving size and servings-per-container are read from the canonical Food record.
- Inventory decrement uses the canonical serving size and updates package remainder.
- Mobile property rows use left labels and right-aligned controls.
- Release identity is v1.4.15.10 / build 141510 / schema 71.

## Static compilation check

TypeScript parser check of `src/main.jsx`: **PASS**

`tsc --allowJs --checkJs false --noEmit --jsx react-jsx --module esnext --target es2022 --moduleResolution bundler src/main.jsx`

## Integrity and release verification

- Project integrity: **PASS**
- Centralized release verification: **PASS**

## Full legacy suite

Result: **454 passed / 122 failed / 576 total**.

The repository contains a large historical test corpus with assertions pinned to superseded release numbers, retired Food/Eat architecture, and intentionally removed legacy `opened` behavior. Those failures remain visible and are not represented as passing. The release-specific tests for the agreed scope pass.

## Production build

The production build could not execute because the supplied source archive did not include installed dependencies and `vite` was unavailable in the sandbox:

`sh: 1: vite: not found`

The prebuild project-integrity repair completed successfully before that dependency failure.
