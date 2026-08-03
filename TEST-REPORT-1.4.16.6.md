# Test Report — Fizz Health v1.4.16.6

## Focused playback and queue regression suite

Command:

`node --test tests/v1416166-podcast-playback-stability.test.js`

Result: **9 passed / 0 failed**.

Validated:

1. v1.4.16.6 release and schema metadata.
2. Genuine `ended`-event completion with removal of the former 95% early-completion rule.
3. Duplicate completion protection keyed to the current episode.
4. Full source release and transient-state reset between episodes.
5. Same-episode-only resume; new and completed episodes begin at 0:00.
6. Deletion of only the completed Up Next entry.
7. Sequential autoplay deferred until the replacement source is playable.
8. Manual Previous and Next controls preserve queue entries.
9. Queue adjacency based on `queue_position` for future drag-reordering compatibility.

## Project verification

- `npm run integrity:check`: passed.
- `npm run verify:release`: passed.
- `node --check src/database.js`: passed.
- Final archive root inspection: one `package.json`, one `src` tree, no generated dependency directory.

## Inherited suite

The supplied baseline's full source-pattern suite was executed during verification: **623 passed / 252 failed**. The failures are the established inherited source-pattern failures and are not introduced by this release. The new v1.4.16.6 suite passes independently.

## Production build limitation

`npm clean-install --progress=false` could not retrieve the locked `xlsx@0.18.5` tarball from the sandbox's internal npm mirror (HTTP 404). Consequently, Vite was unavailable and a local production build could not be executed in this environment. Cloudflare's deployment environment previously retrieved the same locked dependency successfully; the release reports do not claim a local build pass.

## Runtime scenarios represented by the focused gates

- Single-item queue termination.
- Multi-item sequential adjacency.
- Manual next and previous transitions.
- Same-episode resume and new-episode 0:00 initialization.
- Queue persistence semantics during item-specific removal.
- Long/short duration independence by relying on the native `ended` event rather than percentage thresholds.
