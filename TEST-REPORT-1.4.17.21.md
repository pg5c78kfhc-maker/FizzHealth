# TEST REPORT — Fizz Health v1.4.17.21

## Release under test

- Version: **1.4.17.21**
- Build ID: **141721**
- Database schema: **147** (unchanged)
- Baseline: **v1.4.17.20 FULL-SOURCE**
- Release: **Audible Refresh, Runtime Formatting & Library Expansion**

## Focused release tests

Command:

`node --test tests/release-1.4.17.21.test.js`

Result: **PASS — 5/5 tests passed, 0 failed**.

Covered:

- 172 seeded unique Audible audiobook ASINs and exclusion of Audible podcast rows from the audiobook model.
- Representative fourth-capture audiobook import.
- Corrected Audible Catalog request using supported `image_sizes=570` and normalization of a 570px cover response.
- Adaptive aggregate duration formatting for days and years without unnecessary zero-value units.
- Audible Library pull-to-refresh wiring, runtime coverage visibility, and current release metadata.

## Seed SQL / compatibility verification

The generated Audible seed SQL was executed **twice** against an in-memory SQLite schema matching the schema-147 Audible tables to verify idempotency.

Result: **PASS**.

After two executions:

- Audiobooks: **172**
- Unique ASINs: **172**
- Series: **32**
- Audiobook-author links: **188**
- Audiobook-narrator links: **195**
- Titles with source-captured total runtime before online enrichment: **105 / 172**
- Missing source-captured total runtime: **67**
- Source-captured runtime total: **69,227 minutes = 48d 1h 47m**

No schema bump was required. Existing schema-147 installations receive the fourth audiobook seed batch through the existing idempotent Audible seed synchronization.

## Source-import fidelity check

The supplied fourth Audible Library capture contains a mixture of audiobook product (`/pd/`) rows and Audible podcast/show/episode (`/podcast/`) rows. The release importer added only the **22 audiobook product records** represented in that capture. Audible podcast rows were intentionally excluded from `audible_audiobooks` rather than being misclassified as owned books.

Non-scalar box-set series positions such as `1-3` and `1-8` were not coerced into false numeric values; the source title remains intact and `series_position` is left unset for those records.

## Project integrity

Command:

`npm run integrity:check`

Result: **PASS** — one application root, one package manifest, one source tree, and expected project structure.

## Release metadata verification

Command:

`node scripts/verify-release.mjs`

Result: **PASS** — `v1.4.17.21 / FH-17121.1-FH-17121.4` verified.

## JSX parser check

`src/main.jsx` was parsed using the environment's TypeScript JSX parser (`ScriptKind.JSX`).

Result: **PASS — 0 parse diagnostics**.

## Broad regression suite

Command:

`node --test tests/*.test.js`

Result: **RED — 844 passed / 356 failed / 1,200 total**.

The repository-wide suite contains numerous historical release-locked/version/source-pattern tests that assert older application versions or exact historical source text. The exact 356-failure set was not reclassified individually, so this report does not claim that every broad-suite failure is harmless. The v1.4.17.21 focused tests pass independently.

## Adjacent Podcast regression sampling

Command:

`node --test tests/v1416163-podcast-player.test.js tests/v1416166-podcast-playback-stability.test.js tests/v141634-podcast-playback-reliability.test.js`

Result: **11 passed / 10 failed / 21 total**.

The sampled failures continue to include historical v1.4.16.x release/version assertions. Behavioral checks in the sample including wake-lock lifecycle, autoplay requests, playlist-position advancement, absent episode-metadata tolerance, and large-playlist paging passed. No Podcast implementation was intentionally changed by v1.4.17.21.

## Audible metadata repair and live-network limitation

v1.4.17.20 requested `image_sizes=500` from the Audible Catalog endpoint. The endpoint accepts a constrained set of image sizes; v1.4.17.21 changes that request to the supported **570px** size and updates the normalizer accordingly. This corrects a request-level failure that could prevent both cover and runtime metadata from resolving.

The request construction/response path is covered with a mocked fetch test. The container environment cannot resolve external Audible hosts, so a live request to `api.audible.com` could not be executed here. Actual on-device network/CORS behavior therefore remains a deployment verification item. The new pull-to-refresh path allows explicit retry without overwriting source data when the request is unavailable.

## Dependency installation / production build

Command:

`npm ci`

Result: **FAIL — environment/toolchain blocker**.

Exact blocker: the environment registry returned **404 Not Found** for pinned `xlsx@0.18.5`:

`https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

Command:

`npm run build`

Result: **FAIL** after the dependency-installation blocker. Project integrity prebuild passed, but Vite was unavailable:

`sh: 1: vite: not found`

No production Vite build success is claimed.

## ZIP validation

Both release ZIPs were subjected to `unzip -t` integrity checks and clean-directory extraction checks after packaging. Results are recorded as PASS only after those checks completed successfully.
