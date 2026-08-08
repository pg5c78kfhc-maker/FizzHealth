# Test Report — Fizz Health v1.4.17.17

## Release focus
Compact the completed/early-ended workout calorie exchange control and integrate recorded workout calorie estimates into maintenance intelligence without double-counting activity already represented by observed weight trend.

## Focused release regression
Command:
`node --test tests-release/v141717-workout-exchange-maintenance.test.mjs`

Result: **5 passed / 0 failed**.

Covered:
- release metadata reports v1.4.17.17;
- completed/early-ended workouts use a compact Export/Import icon inside the top-right action row;
- Export changes to Import after the existing `calorie_exported_at` state is set;
- the four-icon action footprint is reserved only on the workout title row so metadata below keeps full width;
- workout calorie estimates enter the maintenance calculation as activity context without being added twice;
- maintenance decision traces disclose workout-estimate coverage, average workout expenditure, and background-maintenance context.

## Existing maintenance dispatcher regression
Command:
`node --test --test-name-pattern='dispatcher owns ranking, pantry matching, and maintenance estimation paths' tests/decision-engine.test.js`

Result: **1 passed / 0 failed**.

## Project integrity
Command: `npm run integrity:check`

Result: **PASS** — one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Release metadata
Command: `npm run verify:release`

Result: **PASS** — v1.4.17.17 / FH-17117.1-FH-17117.4.

## Broad legacy suite
Command: `npm test`

Result: **832 passed / 352 failed / 1,184 total**.

The broad suite remains red because numerous older source-pattern tests assert superseded implementation shapes. This release does not claim those pre-existing failures are resolved.

A direct run of the complete `tests/decision-engine.test.js` file produced **23 passed / 1 failed**; the single failing assertion is the pre-existing Chef recommendation wording assertion (`Uses an open package`) and is unrelated to this release. The maintenance dispatcher test itself passes.

## Production dependency/build gate
Command: `npm ci --ignore-scripts`

Result: **BLOCKED BY REGISTRY** — the environment returns HTTP 404 for pinned `xlsx@0.18.5` from the internal npm registry.

Command: `npm run build`

Result: **NOT RUN TO COMPLETION** — Vite is unavailable because dependencies could not be installed (`vite: not found`). No successful production build is claimed.

## Database compatibility
No database or migration changes. Schema remains **146**. Existing workout calorie-estimate columns from schema 146 are reused.
