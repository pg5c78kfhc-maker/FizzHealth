# Test Report — Fizz Health v1.4.17.25

## Release under test

- Version: **1.4.17.25**
- Baseline: **v1.4.17.24 FULL-SOURCE**
- Database schema: **147 (unchanged)**
- Scope: Audible JSON Library Exchange

## Focused release tests

Command:

`node --test tests/release-1.4.17.25.test.js`

Result: **PASS — 7 passed / 0 failed / 7 total**.

Coverage includes:

- Release/version identity and unchanged schema 147.
- Versioned Audible request format and 50-record batch request generation.
- New-batch and existing-incomplete enrichment request modes.
- JSON fence/surrounding-text normalization and response validation.
- Audiobook-only enforcement.
- ASIN validation and duplicate-ASIN rejection.
- HTTPS artwork/product URL validation.
- Runtime/listening/ownership validation.
- Existing-record export and reconciliation summary.
- Presence of transactional ASIN reconciliation and post-import cover-cache warming in the Audible exchange implementation.
- Current source seed remains 450 unique Audible ASINs; future library growth is performed by JSON import rather than source seeding.

## Project integrity

Command:

`node scripts/project-integrity.mjs`

Result: **PASS**.

Output: `Project integrity OK: one application root (.), one package.json, one src tree, one isolated Menu/Chef implementation.`

The same integrity repair/check path also ran successfully as the `prebuild` stage before the production-build attempt.

## Release metadata verification

Command:

`npm run verify:release`

Result: **PASS**.

Output: `Release metadata verified: v1.4.17.25 / FH-17125.1-FH-17125.4`

Verified metadata includes `package.json`, `VERSION.json`, main UI version/build/deployment constants, decision-engine version, service-worker cache version, release-history head, and current `ReleaseNotes.md`.

## Broad regression suite

Command:

`node --test tests/*.test.js`

Result: **FAIL — 856 passed / 362 failed / 1,218 total**.

The broad suite remains red because the repository contains many historical release assertions and legacy UI/source-pattern tests that intentionally assert older versions or superseded application structures. Examples include tests explicitly requiring releases such as v1.4.15.x/v1.4.16.x, former footer structures, obsolete workout selection behavior, and previous schema expectations. The new v1.4.17.25 focused suite passed independently. No broad-suite success is claimed.

## Dependency installation

Command:

`npm ci`

Result: **FAIL — environment/package-registry blocker**.

Exact blocking dependency: pinned `xlsx@0.18.5`.

Registry response:

`404 Not Found - .../xlsx/-/xlsx-0.18.5.tgz`

This is the previously observed environment registry problem and is not an application test success.

## Production build

Command:

`npm run build`

Result: **FAIL — production build not executed successfully**.

`prebuild` project-integrity repair passed, then the build command failed with:

`sh: 1: vite: not found`

Because `npm ci` could not install dependencies, Vite was unavailable. A successful production bundle is **not claimed**.

## Schema / compatibility verification

- No schema migration was introduced; schema remains **147**.
- The new exchange reuses existing Audible tables and existing `cover_image_url` / `cover_image_source` fields.
- Current 450-book seed uniqueness is covered by the focused test.
- Import implementation validates the full response before invoking the database transaction; the transaction wrapper restores/rolls back on failure according to the existing database transaction infrastructure.
- No migration-specific compatibility test was required because no structural database change occurred.

## Archive verification

Both release ZIPs were subjected to `unzip -t` integrity testing and clean extraction after packaging. Results are recorded as **PASS** in the final packaging step.

## Known environmental limitations

- The environment cannot install pinned `xlsx@0.18.5`, which prevents the Vite production build.
- No claim is made that live iPhone clipboard permissions or live remote cover-host behavior were simulated in this container. The exchange retains manual textarea paste as the iOS fallback, and the previously field-tested v1.4.17.24 artwork URL/cache path is reused.
