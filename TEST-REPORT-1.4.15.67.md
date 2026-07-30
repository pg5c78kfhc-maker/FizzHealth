# Fizz Health v1.4.15.67 — Test Report

## Release

- Version: 1.4.15.67
- Build: 141567
- Deployment: FH-20260730-141567
- Schema: 93
- Release: Modern Record Routing & Recipe Creation Stabilization

## Implemented

- Prepared Recipe Food shells now receive the calculated nutrition of their source Recipe when a batch is created.
- Existing prepared Recipe shells are repaired during deferred startup maintenance.
- Prepared Recipe shells and Recipe Menu entries resolve to the modern Recipe record.
- Standalone Menu Foods open the unified Food record instead of the legacy nutrition-only information page.
- New Recipes write their current Recipe rows, canonical definition, and canonical components directly during save.
- Canonical Recipe definitions use `source_type = recipe` and are excluded from the independent Meals list.
- Recipe create/edit layout is constrained to the usable viewport above fixed bottom navigation.

## Targeted regression tests

Command:

`node --test tests/inventory-availability.test.js tests/v141565-recipe-form-availability-stabilization.test.js tests/v141566-availability-engine-stabilization.test.js tests/v141567-modern-record-recipe-stabilization.test.js`

Result: **16 passed / 0 failed**.

Coverage included:

- Tracked and untracked Recipe availability.
- Packaged Pantry quantity normalization.
- Prepared Recipe nutrition synchronization hooks.
- Modern Food and Recipe routing.
- Direct canonical Recipe creation.
- Recipe editor viewport containment.

## Release verification

- `npm run integrity:check`: **passed**.
- `npm run verify:release`: **passed**.

## Full historical suite

`npm test` executed 747 tests: **531 passed / 216 failed**.

The failures are existing broad historical assertions across aggregate nutrition, decision wording, legacy presentation, and other unrelated areas. The targeted v1.4.15.67 tests passed completely.

## Production build

A local Vite production build could not be performed because dependency installation is blocked by the environment registry returning HTTP 404 for the locked `xlsx@0.18.5` package. No source-level build error was observed before dependency resolution stopped.
