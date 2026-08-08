# Fizz Health v1.4.17.26 Test Report

## Release

- Version: **1.4.17.26**
- Build: **141726**
- Database schema: **147** (unchanged)
- Baseline: **v1.4.17.25 FULL-SOURCE**
- Scope: corrective Audible JSON existing-record enrichment import fix

## Defect diagnosis

The v1.4.17.25 existing-audiobook UPDATE contained **22 SQL placeholders** but supplied **23 bound values**. The extra value occurred in the Audible ownership/library portion of the parameter list and shifted every later bind. SQL.js therefore rejected the update with the field-observed `column ... out of range` failure before commit.

v1.4.17.26 centralizes the existing-update contract in `src/audio/audibleExchangePersistence.js`. The corrected UPDATE has **22 placeholders and 22 values**.

## Focused corrective tests

Command:

`node --test tests-release/v141726-audible-exchange-import-fix.test.mjs`

Result: **PASS — 6 passed / 0 failed / 6 total**.

Coverage:

1. v1.4.17.26 release metadata and schema 147.
2. Existing-record UPDATE placeholder/bind alignment and simultaneous runtime + cover persistence.
3. Preservation of existing non-null metadata, owned state, and explicit finished status.
4. Existing-only upsert path executes the corrected UPDATE contract without the former bind mismatch.
5. New-record insert path remains parameter-aligned and relationship writes remain intact.
6. Duplicate-ASIN and malformed-cover validation remains active; modal still uses transactional import and primes the existing cover cache after success.

## Syntax checks

Commands:

- `node --check src/audio/audibleExchangePersistence.js`
- `node --check src/audio/audibleExchange.js`

Result: **PASS**.

## Project integrity

Command:

`node scripts/project-integrity.mjs`

Result: **PASS** — one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Release metadata verification

Command:

`node scripts/verify-release.mjs`

Result: **PASS** — `v1.4.17.26 / FH-17126.1-FH-17126.4`.

## Broad regression suite

Command:

`npm test`

Result: **FAIL — 854 passed / 364 failed / 1,218 total**.

The broad historical suite remains red. The failures begin in long-standing legacy assertions such as Menu/Chef mapping, historical Food/FH-1250 expectations, old release-identification checks, and prior podcast interaction assertions. The new focused v1.4.17.26 corrective suite passes 6/6. No claim is made that the broad suite is green.

## Production dependency installation

Command:

`npm ci`

Result: **FAIL (environment/toolchain blocker)**.

Exact blocker:

`404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

Pinned dependency `xlsx@0.18.5` remains unavailable from the environment registry.

## Production build

Command:

`npm run build`

Result: **FAIL (downstream environment/toolchain blocker)**.

The prebuild project-integrity repair passed, then Vite could not start because dependency installation had failed:

`sh: 1: vite: not found`

A successful production build is **not** claimed.

## Schema / compatibility verification

- Target schema remains **147**.
- No migration was added because the defect was an application-layer SQL bind mismatch, not a schema defect.
- Existing Audible tables/columns are reused unchanged.
- Existing validation and transaction rollback code remains in place.

## Field acceptance still required

This container cannot execute the installed iPhone PWA against its persisted browser SQL.js/IndexedDB database or fetch/cache remote cover images through iOS. The field acceptance test is to retry the previously validated nine-record enrichment payload. Expected result: the import completes instead of reporting `column ... out of range`; the seven supplied cover URLs persist and enter the existing dynamic artwork cache path.

## Archive verification

The FULL-SOURCE and PARTIAL-SOURCE archives are ZIP integrity-tested and clean-extraction-tested after packaging. See delivery response for the generated artifacts.
