# Fizz Health v1.4.15.85 Test Report

## Tests passed

### Focused production-path tests — 11/11 passed

Commands:

`node --test tests/v141585-prepared-recipe-save-corrective.test.js tests/v141583-live-runtime-consolidation.test.js tests/v141582-inventory-service-consolidation.test.js`

Validated:

- One Red Onion container with one 150 g serving reports 150 g available.
- Deducting 150 g consumes exactly one Red Onion and leaves the Pantry row Out of Stock.
- Blueberries remain available through the centralized service.
- Fruit Bowl and Daily Salad availability paths continue to use the centralized service.
- Batch preparation uses centralized inventory diagnostics.
- Failed matched-row consumption throws instead of silently continuing.
- A prepared batch cannot be created while any required quantity remains.
- Save errors render immediately below the form header.
- The Prepared Recipe editor is constrained above the persistent footer.
- The Save checkmark has an active and saving-only disabled state.

### Full historical suite

Command: `npm test`

- Passed: 580
- Failed: 225
- Total: 805

## Tests failed

No focused v1.4.15.85 test failed.

## Pre-existing failures

The 225 full-suite failures are legacy assertions that pin earlier versions, retired layouts, obsolete labels, or historical implementation text. The v1.4.15.84 baseline report also identified 225 pre-existing failures.

## New failures

- New failures introduced by v1.4.15.85: 0

One older source-pattern test was updated from the former local variable name `usedTarget` to accept the corrected `requestedFromRow` deduction variable. The underlying behavior test remains unchanged.

## Production compilation/build result

Command: `npm run build`

Result: **Not completed — environment dependency failure**

- Project integrity repair passed.
- The build then stopped with `sh: 1: vite: not found`.
- The supplied FULL-SOURCE archive did not contain installed `node_modules`.
- A successful production build is not claimed.
- No compiled output was added.

## Anything that could not be tested

The uploaded source archive does not contain the installed PWA's live SQLite database. Therefore the literal user records for Daily Salad and Red Onion could not be executed in this sandbox. The supplied record values were tested through the production inventory service, and the runtime save path was hardened so the installed app will now expose the exact ingredient/record failure rather than silently skipping it.
