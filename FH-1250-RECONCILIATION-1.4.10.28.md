# FH-1250 Reconciliation — Fizz Health v1.4.10.28

## Baseline

- Source inspected: `Fizz-Health-v1.4.10.27-FULL-SOURCE.zip`
- Release produced: `1.4.10.28`
- PMO implementation slice: `FH-1250.25`

## Implemented

- Retained and verified the v1.4.10.27 recipe parity and Pantry Intelligence changes:
  - recipe favorites,
  - recipe Recent integration,
  - All-location pantry view,
  - active vs. out-of-stock separation,
  - non-misleading unavailable score state,
  - pantry score/confidence explanations,
  - pantry-item detail/edit workflow,
  - X/title/checkmark pantry editors,
  - Eat Next recommendations from in-stock inventory.
- Removed the large floating add button from the Food landing page, matching the Pantry subsystem protocol.
- Added a compact Add Food action to the Food page header.
- Prevented the virtual `All` location filter from being stored as a pantry item's physical location. Manual creation now defaults to Home or the first configured real location.
- Synchronized runtime, build, package, service-worker, release-history, and release-note metadata to v1.4.10.28.

## Verification

- Automated tests: 193 passed, 0 failed.
- Release metadata verification: passed.
- Production build: not completed because the sandbox could not install/resolve the Vite executable (`vite: not found`). The source-level test suite and release verifier both passed.

## Files changed

- `src/main.jsx`
- `src/decision/engine.js`
- `public/sw.js`
- `package.json`
- `package-lock.json`
- `VERSION.json`
- `release-history.json`
- `CHANGELOG.md`
- `ReleaseNotes.md`
- `tests/v141022-corrective.test.js`
- `tests/v141028-navigation-polish.test.js`
