# Test Report — Fizz Health v1.4.14.9

## Focused verification

Command:

`node --test tests/aggregate-nutrition-integrity.test.js tests/v14149-startup-performance.test.js`

Result:

- 13 passed
- 0 failed

Coverage includes:

- Canonical Recipe calculations from current Food nutrition.
- Canonical nested Recipe calculations within Meals.
- Unknown nutrition remaining distinct from valid zero.
- Database-wide Recipe and Meal aggregate audit behavior.
- Prevention of direct low-level Recipe aggregation from UI consumers.
- Explicit integrity states and duplicate Meal component detection.
- Immediate pre-JavaScript launch shell.
- Nutrition refresh excluded from the blocking boot function.
- Startup timing persistence.
- Deferred-work failure isolation.

## Structural verification

- `npm run integrity:check`: passed.
- `npm run verify:release`: passed.

## Historical suite

Command:

`node --test tests/*.test.js`

Result:

- 427 passed
- 94 failed
- 521 total

The failing historical tests are primarily brittle assertions for previous version metadata, removed wording, and retired layouts. The new startup tests and the aggregate-nutrition regression suite pass completely.

## Build

A production Vite build was not executed. The source archive did not include `node_modules`, and dependency installation was unavailable in the execution environment.
