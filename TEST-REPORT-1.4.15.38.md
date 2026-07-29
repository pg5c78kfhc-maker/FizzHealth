# Fizz Health v1.4.15.38 Test Report

## Result

**Conditional pass for implemented source changes.** The release-specific and prior functional inventory/shopping tests passed. A production Vite build could not be completed because the sandbox package registry returned HTTP 404 for the pinned dependency `xlsx@0.18.5`.

## Tests executed

### Passed

- v1.4.15.38 release identity
- Actual inventory deduction is capped at available quantity
- Exact before-snapshot reversal
- Duplicate adjustment prevention using source record + Pantry record identity
- Impossible deduction logging
- Shopping image refresh progress
- Loaded / Cached / Fetching / Not Found / Blocked states
- Existing Product Link persistence
- Shopping eligibility and discontinued exclusion
- Product image/name fallback
- Planned and direct consumed-food Pantry resolution
- Recipe and Meal component adjustment coverage
- Delete consumed restores recorded adjustments

### Legacy expected failure

`tests/v141537-inventory-shopping-corrective.test.js` contains one release-identity assertion hard-coded to `VERSION='1.4.15.37'`. All functional assertions in that test passed; only the obsolete version assertion failed after correctly advancing the release to `1.4.15.38`.

## Inventory integrity scenarios verified by implementation and release tests

- 6 apples → consume 1 → records delta 1 and leaves 5
- Delete consumed apple → restores exact pre-consumption snapshot of 6
- Requested deduction larger than stock → records only actual deduction and logs integrity warning
- Duplicate source event → unique database index prevents duplicate adjustment record
- Reload/restart replay → source-record idempotency prevents repeated adjustment persistence
- Count and measured quantities → nonnegative transition safeguards apply to both
- Recipes and Meals → all component adjustments are grouped and reversibly recorded

## Build verification

- Project integrity check: **Passed**
- Vite production build: **Blocked by environment dependency availability**
- Registry error: `404 Not Found` for `xlsx-0.18.5.tgz`

## Live data protection

No user Pantry data was imported or modified. Testing used source-level and isolated regression assertions only.
