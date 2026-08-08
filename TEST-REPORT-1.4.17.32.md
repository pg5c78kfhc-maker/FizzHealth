# Test Report — Fizz Health v1.4.17.32

## Focused acceptance tests

`node --test tests-release/v141732-audible-only-fulfillment.test.mjs`

Result: **5 passed / 0 failed**.

Coverage includes:

- version/build advancement to v1.4.17.32 / 141732 with schema 147 unchanged;
- cover-targeted enrichment hard-capped at 25 records;
- UI copy updated to “Covers up to 25”;
- Audible.com-only catalog fulfillment instructions generated for add-new, full enrichment, and targeted enrichment requests;
- explicit prohibition of podcast directories and unrelated third-party catalog/web sources;
- exact supplied Audible product URL / ASIN-first cover workflow;
- Audible page metadata checks including `og:image`, structured/JSON-LD image data, and product image/srcset;
- no fabricated/reverse-engineered cover URLs;
- exact Audible URL source-evidence requirement;
- existing 10-record full-enrichment and 50-record add-new batch sizes unchanged;
- existing Base64 UTF-8, SHA-256, and stateless-import requirements unchanged.

## Historical repository suite

`node --test tests/*.test.js`

Result: **852 passed / 366 failed (1218 total)**.

These totals exactly match the supplied v1.4.17.31 baseline documented in the prior release. No increase in the historical failure count was introduced by this release.

## Integrity / release verification

- `node scripts/project-integrity.mjs` — PASS.
- `node scripts/verify-release.mjs` — PASS; verified v1.4.17.32 and story range FH-17132.1–FH-17132.4.
- `node --check src/audio/audibleExchange.js` — PASS.

## Production build

`npm run build` was attempted. The integrity prebuild step passed, but Vite could not launch because the supplied source archive contains no installed `node_modules` and the environment has no `vite` executable. The build therefore stopped with `vite: not found`. This is an environment/dependency availability limitation, not a source-code test failure.
