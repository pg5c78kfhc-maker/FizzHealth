# Regression Report — Fizz Health v1.4.13.1

## Scope reviewed

Story 2 only: Menu Header Redesign.

## Regression assessment

- Automated suite result: 361 passed / 67 failed out of 428.
- Accepted v1.4.12.1 baseline evidence reports the same 361 passed / 67 failed result.
- Net new automated-test failures: **0**.
- Project integrity: passed.
- Release metadata synchronization: passed.

## Preserved behavior

The implementation leaves unchanged:

- Calendar navigation and date selection
- Today action
- Restaurant Day behavior
- Nutrition summary calculations and display
- Meal containers and add/remove/lock behavior
- Saved-meal and restaurant browsing
- Database schema and persistence
- JSON exchange behavior
- Settings
- Routing destinations

## Build limitation

A production build could not be validated because Vite was not available in the extracted dependency tree and dependency installation did not complete in this execution environment. This is reported as an environment/tooling limitation, not as a successful build.
