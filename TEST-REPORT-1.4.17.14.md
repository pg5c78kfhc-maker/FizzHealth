# Fizz Health v1.4.17.14 — Test Report

## Environment

- Date: 2026-08-07
- Release: v1.4.17.14 — Compact Program Cards
- Database schema target: 146 (unchanged)
- Source baseline: Fizz Health v1.4.17.13 FULL-SOURCE

## Commands run

```text
node --test tests-release/v141714-program-card-compaction.test.mjs
node --test tests-release/v141714-program-card-compaction.test.mjs tests-release/v141713-calorie-import-parser-hotfix.test.mjs tests-release/v141712-workout-end-calorie-exchange.test.mjs tests-release/v141710-program-lifecycle-tabs.test.mjs
npm run integrity:check
npm run verify:release
npm run build
npm install
npm test
```

## Focused release results

PASS — 5/5 v1.4.17.14 presentation tests:

1. Active cards suppress the redundant Active badge and Active action.
2. Active cards opt into the compact presentation layout.
3. Program copy/description use the available horizontal card width while only the title reserves space for edit/add controls.
4. The disclosure chevron is centered on the bottom edge of the program card.
5. Release metadata remains schema-compatible at schema 146.

PASS — Combined workout lifecycle/exchange/presentation regression: 14/14.

## Integrity results

PASS — `npm run integrity:check`

Project integrity reports one application root, one package.json, one src tree, and one isolated Menu/Chef implementation.

PASS — `npm run verify:release`

Release metadata verified as v1.4.17.14 / FH-17114.1-FH-17114.4.

## Migration results

Not applicable. No database migration was added. Target schema remains 146. Existing workout executions, program lifecycle state, imported history, and calorie estimates are unchanged.

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

The broad suite remains red from legacy/stale source-pattern assertions already present in the project. The v1.4.17.14 focused tests and adjacent workout lifecycle regressions are green.

## Acceptance criteria verified

- Active lifecycle tab remains present: PASS.
- Redundant Active badge is removed from cards shown on Active: PASS.
- Redundant Active card action is removed: PASS.
- Edit and add-history controls remain available: PASS.
- Program title, metadata, goal, and description remain available: PASS.
- Active program card no longer reserves the old right-side column through the full card height: PASS.
- Description can use full available horizontal width: PASS.
- Program disclosure chevron is centered at the bottom edge: PASS.
- Chevron continues to switch between down/up according to collapsed/expanded state: PASS.
- Nested workout hierarchy and lifecycle behavior remain unchanged: PASS.
- Database schema/data unchanged: PASS.
- Production build successfully completes: NOT VERIFIED — environment blocked by `xlsx@0.18.5` registry 404.
