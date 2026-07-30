# Fizz Health v1.4.15.66 — Test Report

## Scope validated

- Tracked Recipes require prepared Recipe inventory.
- Untracked Recipes use current ingredient availability without requiring a prepared batch.
- Packaged Pantry inventory is normalized into the Recipe ingredient unit.
- Sealed packages and open-package contents are included in availability.
- Package inventory is deducted consistently when preparing a Recipe batch.
- Recipe Detail and Meal Planner use the current Pantry records and package metadata.

## Results

- Targeted v1.4.15.65 + v1.4.15.66 regression tests: **7 passed / 0 failed**.
- Release metadata verification: **passed** (`v1.4.15.66`, schema `92`, story `FH-1566.5`).
- Project integrity verification: **passed**.
- JavaScript syntax checks for changed non-JSX modules and database migration: **passed**.

## Broader test-suite status

The repository-wide historical test run completed with **530 passed / 213 failed**. The failures are existing broad-suite expectations outside this release scope, including aggregate-nutrition and older presentation assertions. The new availability tests and the immediately preceding stabilization tests all passed.

## Production build limitation

A local production build could not be executed because dependency restoration is blocked by the environment registry returning HTTP 404 for the locked `xlsx@0.18.5` package. This occurs before Vite compilation and is not caused by the release code.

## Primary blocking scenario reproduced

A Pantry record with 3 bottles, 2 sealed bottles at 946 mL each, and 950 mL in the open bottle now resolves to **2,842 mL available**. A Recipe requiring 40 mL is therefore available rather than incorrectly marked insufficient.
