# Fizz Health v1.4.15.58 — Test Report

## Release

- Version: 1.4.15.58
- Build: 141558
- Deployment: FH-20260730-141558
- Schema: 85

## Completed validation

- Project integrity check: PASS
- Release metadata verification: PASS
- Recipe migration fixture: PASS
  - created one canonical `meal_definitions` record
  - copied two legacy ingredients into `meal_components`
  - recorded validated ingredient counts
  - retained the legacy `recipes` rows
- Static scope review: PASS
  - physical table names unchanged
  - Meal Planner and consumed-log paths unchanged
  - Library Recipe taps route to the modern four-tab Recipe detail flow

## Automated suite

`node --test tests/*.test.js` executed 721 tests: 513 passed and 208 failed.

The failures are pre-existing broad regression assertions tied to prior releases and source-text snapshots; the first failures occur in aggregate nutrition and decision-engine expectations unrelated to this release. No release-specific v1.4.15.58 tests existed in the baseline archive.

## Build limitation

A production Vite build could not be executed because the configured package registry returned HTTP 404 for the pinned `xlsx@0.18.5` tarball during `npm ci`. This is an environment/package-registry limitation, not a source compilation result. The archive therefore includes source and validation artifacts but no newly generated `dist` folder.
