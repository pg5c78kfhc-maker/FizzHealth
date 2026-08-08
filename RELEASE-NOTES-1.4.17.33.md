# Fizz Health v1.4.17.33 — Audible Add-New Reconciliation Fix

## Scope

This corrective release is limited to Audible universal exchange validation for `add_new` responses. It does not redesign the Audible UI, change cover-art behavior, modify unrelated audiobook metadata, or change the database schema.

## Changes

- `add_new` responses may legitimately contain `requested_asins: []`; that empty list is no longer interpreted as an expectation of zero returned records.
- `add_new` completeness is validated against `expected_record_count`.
- Every returned add-new audiobook must still contain a valid 10-character Audible ASIN.
- Duplicate Audible ASINs are still rejected before import.
- `enrich_existing` and `enrich_targeted` retain exact ASIN reconciliation and order enforcement when explicit requested ASINs are supplied.
- Batch-count failures now report the actual expected and received audiobook record counts directly.
- The existing clipboard-safe Base64 UTF-8 transport, SHA-256 verification, strict JSON parsing, stateless import behavior, atomic transaction protection, and 25-record cover-only targeted limit remain unchanged.

## Acceptance validation

- A real 50-record encoded `add_new` response from the current workflow was decoded, checksum-verified, parsed, and accepted with 50 records, 50 unique ASINs, and expected count 50.
- A 49-record add-new response against `expected_record_count: 50` is rejected.
- Invalid and duplicate add-new ASINs are rejected.
- A 25-record targeted enrichment response with exact ASIN order is accepted, while reordered or incomplete reconciliation is rejected.

## Versioning

- App version: 1.4.17.33
- Build: 141733
- Database schema: 147 (unchanged)
- Completed stories: FH-17133.1–FH-17133.4
