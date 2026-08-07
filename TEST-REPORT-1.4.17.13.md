# Fizz Health v1.4.17.13 — Test Report

## Environment

- Date: 2026-08-07
- Release: v1.4.17.13 — Calorie Import Parser Hotfix
- Database schema target: 146 (unchanged)
- Source baseline: Fizz Health v1.4.17.12 FULL-SOURCE
- Package registry available through the sandbox internal npm gateway.

## Commands run

```text
node --test tests-release/v141713-calorie-import-parser-hotfix.test.mjs
npm run integrity:check
npm run verify:release
node --test tests-release/v141713-calorie-import-parser-hotfix.test.mjs tests-release/v141712-workout-end-calorie-exchange.test.mjs
node --check src/workout/calorieExchange.js
npm run build
npm install
npm test
```

## Focused release results

PASS — 5/5 parser-hotfix tests:

1. Strict JSON response parses successfully.
2. Markdown-fenced JSON surrounded by explanatory text parses successfully.
3. Smart/curly JSON quotation marks are normalized successfully.
4. Embedded smart-quoted phrases inside JSON string values are preserved as quoted content rather than breaking parsing.
5. A response whose `workout_execution_id` does not match the target workout remains rejected.

PASS — Combined v1.4.17.12 + v1.4.17.13 workout calorie-exchange regression: 9/9.

The focused test fixture reproduces the reported failure mode where the clipboard begins with a Unicode smart opening quote (`“`), which previously caused `JSON.parse` to raise `Unrecognized token`.

## Integrity results

PASS — `npm run integrity:check`

Project integrity reports one application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

PASS — `npm run verify:release`

Release metadata verified as v1.4.17.13 / FH-17113.1-FH-17113.3.

PASS — JavaScript syntax validation for `src/workout/calorieExchange.js`.

## Migration results

Not applicable. No database migration was added. Target schema remains 146.

## Production-build result

NOT SUCCESSFUL / ENVIRONMENT BLOCKED.

`npm run build` reached the Vite invocation but failed because Vite is not installed in the extracted source environment:

```text
sh: 1: vite: not found
```

An attempt to install dependencies with `npm install` failed on the pinned dependency:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz
npm error 404 'xlsx@.../xlsx-0.18.5.tgz' is not in this registry.
```

Because dependency installation is blocked by the package registry, a successful production build is not claimed.

## Broad regression suite

`npm test` completed with:

- Total: 1,184
- Passed: 831
- Failed: 353

The broad suite remains red from legacy/stale source-pattern assertions already present in the project. The release-specific calorie parser tests are green and exercise the actual parser module directly rather than relying on source-string matching.

## Acceptance criteria verified

- Smart/curly quote clipboard JSON imports after normalization: PASS.
- Standard strict JSON continues to import: PASS.
- Optional Markdown code fences are tolerated: PASS.
- Harmless prose surrounding a JSON object is tolerated: PASS.
- Embedded quoted text in response strings remains valid: PASS.
- Wrong-workout calorie responses remain rejected: PASS.
- Unsupported exchange type/schema remains validated by the parser: PASS.
- `estimated_calories` remains required to be a non-negative number: PASS.
- No database/schema changes introduced: PASS.
- Existing workout history/imported historical data is untouched by this source-only parser hotfix: PASS.
- Production build successfully completes: NOT VERIFIED — environment blocked by `xlsx@0.18.5` registry 404.
