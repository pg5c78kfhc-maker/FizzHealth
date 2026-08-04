# Fizz Health v1.4.16.29 — Podcast Refresh Transaction & Recovery Repair

A narrow corrective release for podcast refresh reliability.

## Implemented
- Replaced reusable savepoints with a serialized write queue and fresh top-level transaction state.
- Added bounded 100-record episode import batches with failed-batch isolation and record fallback.
- Delayed success until metadata, playlists, commit, episode accounting, and stored-count verification complete.
- Added parsed, selected, inserted, updated, unchanged, rejected, skipped-by-policy, removed-as-older, and final-stored counters.
- Added transaction, batch, record, retry, commit, rollback, stage, exception, and stack diagnostics.
- Preserved retrieval/XML/parse diagnostics when persistence or later stages fail.
- Added upstream 404/410/permanent-redirect Apple feed recovery, stored URL update, and automatic retry.
- Added explicit MATCH, REDIRECTED, RECOVERED, APPLE_ADVERTISES_DEAD_URL, LOOKUP_FAILED, and NOT_CHECKED URL states.
- Staged latest-only deletion after replacement persistence.
- Preserved existing episodes and used subscription-aware refresh failure text.
