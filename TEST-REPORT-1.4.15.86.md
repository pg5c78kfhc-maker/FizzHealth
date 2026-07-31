# Test Report — Fizz Health v1.4.15.86

## Tests passed

- Project integrity check: passed.
- Focused v1.4.15.86 nutrient-schema tests: 4 passed / 0 failed.
- Database module JavaScript syntax check: passed.
- Verified migration 96 contains every canonical nutrient for all six nutrition persistence tables.
- Verified canonical reconciliation is driven by `NUTRIENT_KEYS`.
- Verified Prepared Recipe existing-food update filters writes through the live `foods` schema.

## Full suite

- 805 tests executed.
- 580 passed.
- 225 failed.
- The failure count matches the pre-existing v1.4.15.85 baseline report; no new failure count was introduced by this release.

## Production compilation/build

- Production build attempted with `npm run build`.
- Prebuild integrity repair passed.
- Build could not start because dependencies are not installed in the supplied source archive: `vite: not found`.
- No successful production build is claimed, and no compiled output was generated.

## Could not be tested

- Migration of the literal database stored in the installed iPhone PWA.
- Live Daily Salad Prepared Recipe save against the user's records.
- Exact Red Onion deduction and resulting Pantry record on the user's device.

These require the device's IndexedDB database, which was not included in the source ZIP.
