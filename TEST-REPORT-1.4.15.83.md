# Test Report — Fizz Health v1.4.15.83

## Tests passed
- Focused v1.4.15.82 inventory consolidation regression suite: 4/4 passed.
- New v1.4.15.83 runtime consolidation suite: 3/3 passed.
- Verified centralized diagnostics contain the required inventory fields.
- Verified one Blueberries container resolves to one available serving through the availability index.
- Verified Fruit Bowl resolves Available through the shared recipe availability path.
- Verified one Red Onion resolves Available for Daily Salad.
- Verified batch deduction consumes one Red Onion through `consumeInventory`.
- Verified Library and Menu no longer call `inventoryAvailableQuantity` directly for serving availability.

## Tests failed
- Full legacy suite: 225 failures, 573 passes, 798 total.

## Pre-existing failures
The full suite already contains broad historical expectation failures unrelated to this release, including aggregate nutrition integrity and old source-text/UI assertions. No failure observed in the focused inventory suites.

## New failures
- None in the focused v1.4.15.83 scope tests.

## Production compilation/build result
- Attempt 1: failed because `vite` was not installed in the supplied source archive.
- Dependency installation attempt: failed because the configured package registry returned HTTP 404 for `xlsx-0.18.5.tgz`.
- Therefore the production build could not be completed and no new compiled output is claimed.

## Could not be tested
- The user’s actual browser-resident SQLite/IndexedDB database was not included in the uploaded source ZIP and is not accessible from this execution environment.
- Consequently, Blueberries, Red Onion, Fruit Bowl, and Daily Salad could not be executed against the user’s literal live database records. Focused tests exercised the production service and production availability index with records matching the stated live values; these are not claimed as live-database validation.
