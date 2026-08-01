# Test Report — Fizz Health v1.4.15.103

## Focused Release Tests

Command:

`node --test tests-release/release-1.4.15.103.test.js`

Result: **4 passed, 0 failed**.

Covered:

- Ellipsis Menu action and Copy Proposed Meals entry.
- Entire-day, meal-service, and selected-item copy scopes.
- Calendar destination-date selection and source-date handling.
- Proposed-state preservation, consumed-state exclusion, duplicate skipping, and copy-interface styling.

## Project Integrity

Command:

`node scripts/project-integrity.mjs`

Result: **Passed**.

The integrity tool reported one application root, one `package.json`, one source tree, and one isolated Menu/Chef implementation.

## Syntax Check

Command:

`node --check src/database.js`

Result: **Passed**.

The JSX application bundle could not be compiled because Vite and project dependencies are unavailable in the supplied environment. Focused static tests and project-integrity checks were completed successfully.

## Existing Regression Suite

Command:

`npm test`

Result:

- Total: **843**
- Passed: **599**
- Failed: **244**

The broad failures are existing historical regression expectations across the long-lived project suite and are not represented as newly passing. The dedicated v1.4.15.103 tests passed.

## Production Build

Command:

`npm run build`

Result: **Failed — environment/tooling**.

Exact failure:

`sh: 1: vite: not found`

The prebuild project-integrity repair completed successfully before the missing Vite executable stopped the build. No successful production build is claimed.
