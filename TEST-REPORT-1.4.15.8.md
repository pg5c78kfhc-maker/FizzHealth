# Fizz Health v1.4.15.8 Test Report

## Result

The release-specific stabilization suite passed **5 of 5 tests**.

Verified:

- Menu Food pencil opens the canonical Food/Nutrition editor and closes the read-only information view first.
- Saving updates the existing `foods` row by `food_id`; no Food insert path was added.
- Turning Ingredient Only off restores canonical `food` classification.
- Menu expanded/collapsed state remains component-owned and scroll position is restored after save or cancel.
- Chef's Picks and category cards use identical stack width, zero inter-card gap, and full-width Chef media.
- Central release metadata verifies as v1.4.15.8 / build 141508 / deployment FH-20260727-141508.

## Commands and evidence

- `node --test tests/v14158-menu-stabilization.test.js` — PASS, 5/5.
- `node scripts/verify-release.mjs` — PASS.
- Full repository test inventory after the change: 567 tests, 452 pass, 115 fail.
- Baseline archive before the change: 562 tests, 447 pass, 115 fail.

The full-suite failure count is unchanged from the supplied baseline. Those 115 failures are legacy tests with historical implementation/version assertions and are not new regressions from v1.4.15.8.

## Production build

A production Vite build could not be executed in this sandbox because dependency installation could not complete: the package gateway did not deliver the uncached `xlsx@0.18.5` tarball, leaving `vite` unavailable. This is an environment/dependency-fetch limitation, not a reported successful build.
