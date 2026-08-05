# Fizz Health v1.4.16.50 Test Report

## Focused regression suite

Command:

`node --test tests/v141650-playlist-consistency.test.js`

Result: **PASS — 4/4 tests**

Validated:

1. Release version and played-disclosure expansion rendering.
2. Deliberate shared swipe threshold plus diagonal and reverse cancellation markers.
3. Shuffle remaining-time subtraction using live playback position.
4. Playlist projection resolution of each podcast's `oldest_first` setting.

## Project integrity

Command:

`npm run integrity:check`

Result: **PASS**

The project contains one application root, one package manifest, one source tree, and one isolated Menu/Chef implementation.

## Production build

Command attempted:

`npm run build`

Result: **BLOCKED BEFORE COMPILATION**

The extracted source did not include installed `node_modules`, so Vite was unavailable. Installing locked dependencies was then attempted with `npm install --ignore-scripts`, but the sandbox package registry returned HTTP 404 for the locked dependency:

`xlsx@0.18.5 — xlsx-0.18.5.tgz`

Therefore the production compiler could not be executed in this environment. This is an environment/dependency-registry failure, not a reported successful build.

## Repository-wide legacy suite

The repository's unfiltered historical suite was also invoked. It contains many version-locked/source-shape assertions from older releases and produced extensive pre-existing failures after current source changes. Those results were not represented as the focused v1.4.16.50 regression result.
