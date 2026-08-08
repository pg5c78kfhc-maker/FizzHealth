# TEST REPORT — Fizz Health v1.4.17.22

## Release under test

- Version: **1.4.17.22**
- Build ID: **141722**
- Database schema: **147** (unchanged)
- Baseline: **v1.4.17.21 FULL-SOURCE**
- Release: **Audible Library Reconciliation & Build-Time Enrichment**

## Audible restart reconciliation

The seven supplied audiobook-only restart pages contained **350 parsed audiobook records**. ASIN reconciliation against the v1.4.17.21 seeded 172-title library produced:

- Restart records parsed: **350**
- Unique restart ASINs: **350**
- Existing ASIN overlaps: **72**
- Genuinely new audiobook ASINs: **278**
- Final seeded audiobook count: **450**
- Final unique ASIN count: **450**

No duplicate ASIN rows are intentionally inserted. Existing overlapping rows are only enriched where the stored field is missing/unknown.

## Focused release tests

Command:

`node --test tests/release-1.4.17.22.test.js`

Result: **PASS — 5/5 passed, 0 failed**.

Covered:

- 450 unique ASIN reconciliation and representative newly imported titles.
- Source-supported runtime and series metadata for restart records.
- Build-time catalog snapshot serialization for real cover URL/runtime data.
- Removal of browser-side Audible catalog fetches.
- Pull-to-refresh stored-metadata reload behavior and separated status line.
- v1.4.17.22 release metadata and unchanged schema 147.

## Seed SQL / compatibility verification

The generated v1.4.17.22 Audible seed SQL was executed twice against a fresh in-memory SQLite schema.

Result: **PASS**.

After the second execution:

- Audiobooks: **450**
- Unique ASINs: **450**
- Series: **94**
- Audiobook-author links: **508**
- Audiobook-narrator links: **562**
- Titles with source-captured total runtime: **276 / 450**
- Missing source-captured total runtime: **174**
- Source-captured runtime total: **196,087 minutes = 136d 4h 7m**
- Snapshot-provided cover URLs in this environment: **0**

Upgrade compatibility was also verified by first applying the v1.4.17.21 172-title seed, setting simulated persisted listening/cover values on an overlapping title, then applying the v1.4.17.22 seed twice.

Result: **PASS** — the database reached 450 unique titles while the simulated existing listening state and cover URL/source remained unchanged.

## Build/import-time Audible catalog enrichment

Command:

`node scripts/enrich-audible-catalog.mjs`

Result: **FAIL — environment/network blocker**.

The Node fetch to `https://api.audible.com` failed because this environment could not resolve/reach the Audible catalog host. Consequently the checked-in `audibleCatalogSnapshot.js` remains empty for live covers in this artifact. No guessed cover URLs were substituted.

The pipeline itself is covered by the focused mocked serialization test, and the installed PWA no longer depends on direct browser-side Audible catalog requests.

## Project integrity

Command:

`npm run integrity:check`

Result: **PASS** — one application root, one package manifest, one source tree, expected project structure.

## Release metadata verification

Command:

`node scripts/verify-release.mjs`

Result: **PASS** — `v1.4.17.22 / FH-17122.1-FH-17122.4` verified.

## JSX parser check

`src/main.jsx` was parsed with the installed TypeScript JSX parser (`ScriptKind.JSX`).

Result: **PASS — 0 parse diagnostics**.

## Broad regression suite

Command:

`node --test tests/*.test.js`

Result: **RED — 847 passed / 358 failed / 1,205 total**.

The repository-wide suite continues to include a large number of historical release-locked/version/source-pattern assertions. The full 358-failure set was not reclassified individually, so this report does not claim that every broad-suite failure is harmless. The focused v1.4.17.22 tests pass independently.

## Adjacent Podcast regression sampling

Command:

`node --test tests/v1416163-podcast-player.test.js tests/v1416166-podcast-playback-stability.test.js tests/v141634-podcast-playback-reliability.test.js`

Result: **11 passed / 10 failed / 21 total**.

This matches the previous release's sampled count. The failures continue to include historical v1.4.16.x release/version assertions; no Podcast implementation was intentionally changed by v1.4.17.22.

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

Both release ZIPs are extraction-tested and `unzip -t` integrity-tested after packaging. Their final validation result is recorded only after those checks complete.
