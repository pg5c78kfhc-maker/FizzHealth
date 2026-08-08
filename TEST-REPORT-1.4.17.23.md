# Fizz Health v1.4.17.23 — Test Report

## Environment

- Baseline: `Fizz-Health-v1.4.17.22-FULL-SOURCE.zip`
- Release: `1.4.17.23`
- Database schema: `147`
- Date: 2026-08-08

## Focused release tests

Command:

`node --test tests-release/v141723-audible-artwork-enrichment.test.mjs`

Result: **PASS — 5/5 tests**

Coverage verified:

- release/build metadata advanced to v1.4.17.23 while schema remains 147;
- 450 audiobook records remain ASIN-unique and `/podcast/` rows remain excluded;
- 12 local cover files exist, contain JPEG data, and map to validated source artwork URLs;
- seed SQL persists local cover URLs with fill-only semantics and preserves existing runtime/history values;
- Audible UI reports artwork coverage dynamically and keeps pull-to-refresh as a local stored-metadata reload.

## Adjacent Audible foundation regression

Command:

`node --test tests-release/v141718-audio-audible-foundation.test.mjs`

Result: **3 passed / 2 failed / 5 total**.

Both failures are stale historical assertions that intentionally require the old v1.4.17.18 package version and exactly 50 seed books. The behavioral foundation checks for Audio navigation, schema-147 Audible tables, and Audible pages/deep links passed.

## Project integrity

Command:

`npm run integrity:check`

Result: **PASS**.

Output: one application root, one package.json, one src tree, one isolated Menu/Chef implementation.

## Release metadata verification

Command:

`npm run verify:release`

Result: **PASS** after updating `VERSION.json`, `release-history.json`, `ReleaseNotes.md`, and service-worker cache metadata.

Verified release: `v1.4.17.23 / FH-17123.1-FH-17123.4`.

## Audible bulk enrichment execution

Command:

`npm run audible:enrich`

Result: **FAIL — environment/network blocker**.

Node `fetch` failed before receiving data from `api.audible.com`. The container cannot resolve that host. No failed bulk request was represented as successful.

Independent Internet resolution through the available web path validated 12 title/cover matches, and those 12 image assets were downloaded and packaged locally.

Enrichment result delivered in this release:

- covers packaged: **12/450**;
- covers unresolved: **438/450**;
- runtime captured: **276/450**;
- runtime missing: **174/450**;
- known runtime total: **196,087 minutes = 136d 4h 7m**.

## Broad regression suite

Command:

`npm test`

Result: **845 passed / 360 failed / 1,205 total**.

The suite remains red. Failures include long-standing source-pattern and historical release assertions from prior releases. This report does not characterize the broad suite as passing.

## Dependency installation

Command:

`npm ci`

Result: **FAIL — environment/toolchain blocker**.

Exact blocker: registry 404 for pinned package `xlsx@0.18.5` at the environment's internal npm registry.

## Production build

Command:

`npm run build`

Result: **FAIL — build could not start because dependencies were not installed**.

`vite: not found` followed the failed `npm ci`. This is not reported as a successful production build.

## Archive verification

Both FULL-SOURCE and PARTIAL-SOURCE ZIPs passed `unzip -t` with no compressed-data errors and were extracted into clean temporary directories. The extracted FULL archive reported package version `1.4.17.23`; the extracted PARTIAL archive contained the packaged Audible cover assets.
