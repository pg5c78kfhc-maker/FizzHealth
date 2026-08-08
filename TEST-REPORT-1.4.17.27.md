# Test Report — Fizz Health v1.4.17.27

## Result

Focused release verification **passed**. Production Vite compilation could not be executed because the sandbox package registry cannot provide the pinned `xlsx@0.18.5` dependency.

## Passing checks

- `npm run integrity:check` — PASS. One application root, one package manifest, one source tree, Menu/Chef integrity intact.
- `npm run verify:release` — PASS. Release metadata, About-screen bindings, package version, service-worker cache version, decision-engine version, and release history all identify v1.4.17.27 / FH-17127.1-FH-17127.5.
- `node --test tests-release/v141727-audible-json-validity.test.mjs` — PASS, 6/6.

## Focused behavior covered

1. Generated enrichment requests put strict JSON output requirements first and include machine-readable exact-count/order/ASIN invariants.
2. A fully escaped 50-record JSON response parses and validates successfully.
3. Markdown fences and surrounding commentary are rejected instead of silently stripped or repaired.
4. Malformed embedded quotes and truncated JSON fail at syntax stage with an explicit `nothing imported` diagnostic.
5. Schema-stage validation rejects incomplete batches, duplicate ASINs, and reordered/substituted enrichment ASINs.
6. Database schema remains 147.

## Build attempt

`npm run build` reached the package script but failed because `vite` is not installed. A follow-up `npm ci` failed with HTTP 404 for the pinned `xlsx@0.18.5` tarball from the configured sandbox registry. This is an environment dependency-availability limitation, not a Vite compiler diagnostic against the changed source.

## Field acceptance

On-device, generate an **Enrich 50 incomplete** request and confirm the request begins with the new strict JSON rules. Paste a valid complete response and verify the UI reports strict JSON + Audible schema validation before enabling import. Paste a deliberately truncated or fenced response and verify it is rejected before import with actionable syntax diagnostics and no database changes.
