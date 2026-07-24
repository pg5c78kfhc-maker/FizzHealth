# Fizz Health v1.4.11.28 — Today Dashboard Stabilization

Released: July 24, 2026

## Fixed

- FH-1332 Today dashboard runtime stabilization keeps the Home screen available when optional analytics or historical fields are unavailable.
- Complex Today calculations now fail independently instead of taking down the entire dashboard.
- Runtime error details are displayed in the fallback card if another top-level failure occurs.
- Migration 55 now creates the `app_releases` table when it is absent before writing release history.
- Existing user databases that never received this optional metadata table can now complete startup successfully.
- The migration remains transactional and preserves all existing health data if any step fails.

## Story

- FH-1331 migration 55 compatibility repair — Harden migration 55 for databases missing `app_releases`.
