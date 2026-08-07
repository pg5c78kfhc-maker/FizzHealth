# Fizz Health v1.4.17.7 Test Report

## Environment
- Release baseline: Fizz Health v1.4.17.6 FULL-SOURCE ZIP
- Platform: OpenAI sandbox / Linux
- Node-based project validation
- Database schema: 142 (unchanged in this hotfix)

## Commands run
- `node tests-release/v141717-focused.mjs`
- `node scripts/project-integrity.mjs`
- `npm test`
- `node scripts/verify-release.mjs`
- `npm install --ignore-scripts`
- `npm run build`
- ZIP extraction verification with `unzip -t`

## Focused regression results
`node tests-release/v141717-focused.mjs`: **4/4 PASS**

Verified:
1. Nutrition footer route references a defined `FoodHub` and is wrapped in the Nutrition ErrorBoundary.
2. Nutrition landing exposes the current Menu, Log Once, Library, and Restaurants actions.
3. Nutrition landing renders its required Nutrition headings/card structure.
4. v1.4.17.7 package/UI/build/deployment metadata is consistent.

## Project integrity
`node scripts/project-integrity.mjs`: **PASS**

Result: one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Broad regression suite
`npm test`: **FAIL — 822 passed / 344 failed / 1,166 total**.

The existing broad suite contains hundreds of older brittle source-pattern assertions that remain red. The focused hotfix regression tests pass. The release does not represent the broad suite as green.

## Release metadata verification
`node scripts/verify-release.mjs`: **PASS** after updating VERSION.json, release-history.json, decision engine version, service-worker cache version, and current ReleaseNotes.md.

Result: `Release metadata verified: v1.4.17.7 / FH-1717.1-FH-1717.3`.

## Migration results
No migration was added or modified. Schema remains **142**. Workout-history import data is outside this hotfix scope and is not changed.

## Production build
**NOT SUCCESSFUL / ENVIRONMENT BLOCKED.**

`npm install --ignore-scripts` fails with:

`npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

`npm error 404 'xlsx@https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz' is not in this registry.`

Because dependency installation is blocked, `npm run build` reaches the Vite command and fails with:

`sh: 1: vite: not found`

No successful production build is claimed.

## Acceptance criteria verified
- Nutrition footer no longer targets a missing component: **PASS**.
- Nutrition landing component is restored: **PASS**.
- Current landing actions are preserved rather than reverting to obsolete Pantry/Shopping/Chef landing actions: **PASS**.
- Nutrition route has runtime error containment: **PASS**.
- No database/schema change: **PASS**.
- Version metadata consistent across package metadata, UI/About release history, VERSION.json, service worker, decision engine, and release files: **PASS**.
- FULL-SOURCE and PARTIAL-SOURCE archives extract successfully: recorded after packaging.

## Packaging verification
- FULL-SOURCE ZIP extraction: PASS
- PARTIAL-SOURCE ZIP extraction: PASS
