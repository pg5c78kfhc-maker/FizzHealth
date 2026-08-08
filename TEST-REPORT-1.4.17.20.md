# TEST REPORT — Fizz Health v1.4.17.20

## Release under test

- Version: **1.4.17.20**
- Build ID: **141720**
- Database schema: **147** (unchanged)
- Baseline: **v1.4.17.19 FULL-SOURCE**
- Release: **Audible Catalog Metadata Enrichment & Library Expansion**

## Focused release tests

Command:

`node --test tests/release-1.4.17.20.test.js`

Result: **PASS — 6/6 tests passed, 0 failed**.

Covered:

- 150 seeded Audible titles and 150 unique ASINs.
- Representative third-batch titles and series positions.
- Audible Catalog product image/runtime normalization.
- Batch Audible Catalog request construction and response parsing using a mocked network response.
- Removal of the obsolete ASIN-derived Amazon cover-image guess.
- Audible UI wiring for catalog enrichment, persisted real cover URLs, and explicit missing-runtime count.

## Seed SQL / compatibility verification

The generated Audible seed SQL was executed twice against an in-memory SQLite schema matching schema 147 to verify idempotency.

Result: **PASS**.

After two executions:

- Audiobooks: **150**
- Unique ASINs: **150**
- Series: **28**
- Audiobook-author links: **159**
- Audiobook-narrator links: **162**
- Titles with source-captured total runtime before online enrichment: **101 / 150**
- Source-captured runtime total: **64,441 minutes = 1,074h 1m**

No schema bump was required. Existing schema-147 installations receive the third seed batch through the existing idempotent seed synchronization. Only cover URLs explicitly tagged `amazon-asin-derived` are cleared for re-enrichment; verified cover URLs are preserved.

## Project integrity

Command:

`node scripts/project-integrity.mjs`

Result: **PASS** — one application root, one package manifest, one source tree, and expected project structure.

## Release metadata verification

Command:

`node scripts/verify-release.mjs`

Result: **PASS** — `v1.4.17.20 / FH-17120.1-FH-17120.4` verified.

## JSX parser check

`src/main.jsx` was parsed using the installed TypeScript JSX parser (`ScriptKind.JSX`).

Result: **PASS — 0 parse diagnostics**.

## Broad regression suite

Command:

`node --test tests/*.test.js`

Result: **RED — 841 passed / 354 failed / 1,195 total**.

The broad repository suite contains numerous historical release-locked/version/source-pattern tests that assert older application versions or exact source text. Those tests remain red in a current release. The exact 354-failure set was not reclassified individually in this release, so this report does not represent every broad-suite failure as harmless. The new v1.4.17.20 focused tests pass independently.

## Adjacent Podcast regression sampling

Command:

`node --test tests/v1416163-podcast-player.test.js tests/v1416166-podcast-playback-stability.test.js tests/v141634-podcast-playback-reliability.test.js`

Result: **11 passed / 10 failed / 21 total**.

The sampled failures include historical release/version assertions against v1.4.16.x source. Behavioral checks in the sample including wake-lock lifecycle, autoplay requests, playlist-position advancement, absent episode-metadata tolerance, and large-playlist paging passed. No Podcast implementation was intentionally changed by v1.4.17.20.

## Audible network enrichment limitation

The release uses the unauthenticated Audible Catalog endpoint at `https://api.audible.com/1.0/catalog/products`, batching up to 50 ASINs and requesting catalog media/product metadata. The request/response code path was covered with mocked fetch tests.

The container environment could not resolve external Audible network hosts, so a live Audible Catalog request could not be executed here. Actual on-device network/CORS behavior therefore remains an explicit deployment verification item. If catalog access is unavailable, Fizz leaves placeholders/missing runtimes intact and retries unresolved records on a later Audible visit rather than inventing metadata.

## Dependency installation / production build

Command:

`npm ci`

Result: **FAIL — environment/toolchain blocker**.

Exact blocker: registry returned **404 Not Found** for pinned `xlsx@0.18.5` at the environment's npm gateway.

Command:

`npm run build`

Result: **FAIL** after the dependency-installation blocker. Project integrity prebuild passed, but Vite was unavailable:

`sh: 1: vite: not found`

No production Vite build success is claimed.

## ZIP validation

Both release ZIPs passed `unzip -t` integrity checks and clean-directory extraction checks. The FULL-SOURCE extraction contained the application root/package manifest; the PARTIAL-SOURCE extraction contained the expected release-relevant source paths.
