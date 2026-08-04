# Fizz Health v1.4.16.29 — Podcast Refresh Transaction & Recovery Repair

Completed stories: **FH-1629.1-FH-1629.10**.

This narrow corrective release replaces the podcast savepoint import pattern with serialized fresh transactions, imports large feeds in bounded batches with isolated record fallback, and verifies stored episode counts before reporting success. It preserves retrieval and parsing diagnostics after later-stage failures, adds complete episode accounting and transaction diagnostics, wires Apple-advertised feed recovery into upstream 404/410/permanent-redirect handling, stages latest-only cleanup after successful replacement persistence, and preserves existing episodes whenever refresh fails.

The user-facing refresh failure now states that the latest episodes could not be refreshed while existing episodes remain available.

## Validation note

Targeted podcast refresh, retrieval, and diagnostic tests pass. The production build could not be executed in this environment because the configured npm mirror returned 404 for the locked `xlsx@0.18.5` package.
