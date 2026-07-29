# Fizz Health v1.4.15.48 Test Report

## Release

- Version: 1.4.15.48
- Build: 141548
- Deployment: FH-20260729-141548
- Baseline: v1.4.15.47 supplied by the user

## Scope verified

- Legacy four-card Nutrition summary removed from the Food Record Nutrition tab.
- Nutrition display uses the same sections and nutrient order as the embedded editor.
- All 22 supported nutrient fields appear in both view and edit modes.
- Serving amount and unit are combined into one Serving size row.
- Common measure includes its serving-weight context without a separate Unit row.
- Nutrient values and units remain together in display and edit modes.
- Recipe detail cards remain unchanged.
- Existing save, enrichment, meal recalculation, and Promote to Meal paths remain intact.

## Results

### Focused v1.4.15.48 tests

- Passed: 5
- Failed: 0

### Project integrity

- Passed.
- One application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

### Release metadata verification

- Passed.
- VERSION.json, application constants, package metadata, service-worker cache, release history, release notes, and decision-engine version agree on v1.4.15.48.

### Full inherited test suite

- Current release: 521 passed, 200 failed.
- Supplied v1.4.15.47 baseline: 516 passed, 200 failed.
- No additional inherited-suite failures were introduced; the five new release tests passed.
- The 200 existing failures are baseline failures unrelated to this presentation release.

### Production build

- Not completed.
- Dependency installation is blocked because the configured package registry returns HTTP 404 for `xlsx@0.18.5`.
- This is the same external registry limitation documented in recent releases.

## Changed files

- ReleaseNotes.md
- VERSION.json
- package-lock.json
- package.json
- public/sw.js
- release-history.json
- src/decision/engine.js
- src/main.jsx
- src/styles.css
- tests/release-1.4.15.47.test.js
- tests/release-1.4.15.48.test.js
