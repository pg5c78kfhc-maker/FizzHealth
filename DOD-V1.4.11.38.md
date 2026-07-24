# Definition of Done — Fizz Health v1.4.11.38

## FH-1384 — Context-aware archived swipe

- [x] Archived Food right swipe exposes Restore.
- [x] Archived Recipe right swipe exposes Restore.
- [x] Full right swipe restores immediately.
- [x] Archived cards do not expose Add to Food Log or Consume behavior.
- [x] Left swipe remains permanent Delete for archived records.

## FH-1385 — Visible restore on details

- [x] Archived Food detail shows Restore to Active at the top.
- [x] Archived Recipe detail shows Restore to Active at the top.
- [x] A restore icon is available in the detail header.
- [x] Invalid active-only Recipe actions are hidden while archived.

## FH-1386 — Complete archive lifecycle

- [x] Restoring clears `archived` and `archived_at`.
- [x] Restoring records `restored_at`.
- [x] Restoring clears `archive_source`.
- [x] Food and Recipe data are updated in place, preserving IDs and relationships.
- [x] Restored records immediately disappear from Archived and return to Active after refresh.
- [x] Settings → Archived Items uses the same metadata-safe restore behavior.

## FH-1387 — Regression gates

- [x] Focused corrective tests pass: 5/5.
- [x] Central release verification passes.
- [x] Database and decision-engine JavaScript syntax checks pass.
- [x] Version/build/deployment/About metadata updated from centralized sources.
- [ ] Production Vite build executed in sandbox — blocked because dependencies were unavailable.
