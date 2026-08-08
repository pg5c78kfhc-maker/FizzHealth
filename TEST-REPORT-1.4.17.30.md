# Test Report — Fizz Health v1.4.17.30

## Focused acceptance coverage

`node --test tests-release/v141730-audible-encoded-clipboard-transport.test.mjs`

Result: **PASS — 8/8**.

Covered:

1. Version advances to v1.4.17.30 while database schema remains 147.
2. Enrichment requests require the four-line `FIZZ_HEALTH_AUDIBLE_ENCODED_RESPONSE_V1` / `base64-utf8` / SHA-256 transport and retain 10-record completeness requirements.
3. A complete 10-audiobook response containing curly quotes, ASCII quotes, apostrophes, ellipses, em dashes, and Unicode round-trips byte-for-byte through Base64/UTF-8 and validates successfully.
4. Deliberately truncated Base64 is rejected before audiobook validation.
5. Altered but decodable Base64 is rejected by SHA-256 mismatch.
6. Valid transport containing malformed decoded JSON is rejected by strict `JSON.parse()`.
7. Valid encoded JSON still rejects wrong request IDs, incomplete batches, and duplicate ASINs.
8. Step 2 decodes/verifies enrichment transport before preview/import, retains exact ASIN reconciliation and transaction gating, and leaves the add-new raw-JSON path intact.

## Project integrity

`npm run integrity:check` — **PASS**.

`node scripts/verify-release.mjs` — **PASS**.

## Repository-wide historical test suite

`npm test` reports **852 passed / 366 failed / 1218 total**. The untouched v1.4.17.29 baseline reports the exact same **852 passed / 366 failed / 1218 total**, confirming these are pre-existing historical-suite failures rather than regressions introduced by v1.4.17.30.

## Production build

`npm run build` reaches the Vite build step but cannot execute because the supplied source archive does not contain installed `node_modules` and `vite` is unavailable in the extracted environment (`sh: vite: not found`). Prebuild project-integrity repair completes successfully. No dependency versions were changed in this release.
