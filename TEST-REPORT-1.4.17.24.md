# TEST REPORT — Fizz Health v1.4.17.24

## Release under test

- Version: **1.4.17.24**
- Build ID: **141724**
- Deployment ID: **FH-20260808-141724**
- Database schema: **147 (unchanged)**
- Baseline: **v1.4.17.23 FULL-SOURCE**
- Release: **Audible Dynamic Cover Cache**

## Focused release tests

Command:

`node --test tests/release-1.4.17.24.test.js`

Result: **PASS — 6 passed / 0 failed**.

Covered:

- current release identity and unchanged schema 147;
- preservation of 450 unique existing audiobook ASINs;
- validated snapshot remote cover URLs plus packaged local fallback;
- cache warming that skips already-cached URLs and stores new opaque cross-origin image responses;
- persistent service-worker cache for `m.media-amazon.com` covers across application releases;
- remote-first Audible rendering, local packaged fallback, placeholder fallback, and pull-to-refresh cache warming.

## Adjacent focused checks

`npm run integrity:check`

Result: **PASS** — one application root, one package manifest, one source tree, and expected project structure.

`node scripts/verify-release.mjs`

Result: **PASS** — `v1.4.17.24 / FH-17124.1-FH-17124.4`.

TypeScript JSX parser against `src/main.jsx`:

Result: **PASS — 0 parse diagnostics**.

Changed non-JSX JavaScript syntax checks:

- `node --check src/audio/audibleCoverCache.js` — **PASS**
- `node --check src/audio/audibleSeed.js` — **PASS**
- `node --check public/sw.js` — **PASS**

## Audiobook data verification

Node import of the authoritative seed and catalog snapshot reported:

- Audiobooks: **450**
- Unique ASINs: **450**
- Titles with captured runtime: **276**
- Known runtime: **196,087 minutes**
- Validated snapshot remote covers: **12**

The agreed next 50-title import was **not executed**. The uploaded capture was available to implementation only as File Library/search chunks, not as complete raw build input. No partial or inferred rows were inserted. The release therefore remains at 450 titles and explicitly fails that part of the agreed scope.

## Adjacent Podcast regression sampling

Command:

`node --test tests/v1416163-podcast-player.test.js tests/v1416166-podcast-playback-stability.test.js tests/v141634-podcast-playback-reliability.test.js`

Result: **RED — 11 passed / 10 failed / 21 total**.

As in recent releases, this sample contains historical version/source-shape assertions. Behavioral passes include playlist-position advancement, metadata tolerance, and large-playlist paging. No Podcast implementation was intentionally changed by v1.4.17.24.

## Broad regression suite

Command:

`node --test tests/*.test.js`

Result: **RED — 850 passed / 361 failed / 1,211 total**.

The repository-wide suite continues to include many historical release-locked/source-pattern assertions. The 361 failures were not individually reclassified, so this report does not claim that all broad-suite failures are harmless. The new focused release tests pass independently.

## Dependency installation / production build

Command:

`npm ci`

Result: **FAIL — environment/toolchain blocker**.

Exact blocker:

`404 Not Found` for pinned `xlsx@0.18.5` from the configured internal npm registry:

`https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/xlsx/-/xlsx-0.18.5.tgz`

Command:

`npm run build`

Result: **FAIL** after the dependency-installation blocker. The prebuild integrity repair passed, but Vite was unavailable:

`sh: 1: vite: not found`

No successful production build is claimed.

## ZIP validation

Both release ZIPs were integrity-tested with `unzip -t` and extracted into clean temporary directories after packaging. Final results are recorded in the delivery response only after those checks complete.
