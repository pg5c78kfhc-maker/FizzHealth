# Test Report v1.4.13.3

## Automated verification

- Project integrity: Passed.
- Release metadata verification: Passed.
- Node test suite: 428 tests executed; 361 passed; 67 failed.
- Baseline v1.4.13.2: 428 tests executed; 361 passed; 67 failed.
- New automated test failures introduced by this release: 0.

## Build

- Production build could not be completed because dependencies were not present in the archive.
- `npm ci` was attempted but did not complete within the available execution window.
- A direct build attempt therefore failed because the Vite executable was unavailable.

## Functional scope reviewed in source

- Sticky calendar correction.
- Restaurant-style page shell.
- Planned meal-service cards and empty states.
- Restaurant-style menu cards.
- Existing scheduling and restaurant-day handlers preserved.
