# Fizz Health v1.4.11.27 — Migration 55 Compatibility Repair

Released: July 24, 2026

## Fixed

- Migration 55 now creates the `app_releases` table when it is absent before writing release history.
- Existing user databases that never received this optional metadata table can now complete startup successfully.
- The migration remains transactional and preserves all existing health data if any step fails.

## Story

- FH-1331 migration 55 compatibility repair — Harden migration 55 for databases missing `app_releases`.
