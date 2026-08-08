# Test Report — Fizz Health v1.4.17.31

## Focused acceptance coverage

`node --test tests-release/v141731-audible-universal-targeted-exchange.test.mjs`

**Result: 11 passed / 0 failed.**

Coverage includes:

1. Release/version metadata advances to v1.4.17.31 while database schema remains 147.
2. Add-new, full enrichment, and targeted enrichment all generate the Base64 UTF-8 + SHA-256 transport contract.
3. Cover-only requests are compact, patch-based, self-contained, and capped at 50 records.
4. A complete 50-record cover-only encoded response decodes, validates, and resolves against the current library.
5. A valid encoded full-enrichment response imports without matching any currently active request state.
6. A v1.4.17.30-style encoded enrichment response remains valid without its original in-memory request context.
7. Backward-compatible strict raw JSON add-new response parsing remains supported.
8. Fizz record ID / Audible ASIN conflicts are rejected, and enrichment cannot create an unknown audiobook.
9. Targeted cover responses reject unrelated mutable fields; null cover results are no-ops.
10. Cover-only persistence updates only cover columns and does not touch title, description, runtime, authors, narrators, or series data.
11. The UI uses one stateless response parser and exposes the dedicated up-to-50 cover request.

## Historical regression suite

`npm test`

**Result: 852 passed / 366 failed / 1218 total.**

The supplied v1.4.17.30 baseline was run separately and produced the **same 852 passed / 366 failed** result. Failure-name comparison showed **no new failures and no resolved failures** relative to the baseline. The 366 failures are therefore pre-existing historical-suite failures rather than regressions introduced by this release.

## Project integrity

`npm run integrity:check`

**PASS** — one application root, one package.json, one src tree, and the expected isolated Menu/Chef implementation.

## Release metadata verification

`npm run verify:release`

**PASS** — v1.4.17.31 / FH-17131.1-FH-17131.5 metadata is consistent across VERSION.json, package metadata, UI metadata, decision engine, service-worker cache, release history, and ReleaseNotes.md.

## JSX syntax parse

The changed `AudibleExchangeModal.jsx` was parsed with the globally available TypeScript compiler using JSX parsing and `--noEmit`.

**PASS.**

## Production build attempt

`npm run build`

The prebuild integrity repair passed. The Vite production build could not start because the supplied source archive does not include installed `node_modules` and `vite` is therefore unavailable in the active sandbox (`sh: 1: vite: not found`). No application build error was reached.
