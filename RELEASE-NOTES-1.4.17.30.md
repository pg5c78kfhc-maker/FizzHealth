# Fizz Health v1.4.17.30 — Audible Enrichment Clipboard-Safe Transport

## Implemented scope

- Existing-audiobook enrichment responses no longer travel through the iPhone clipboard as raw JSON.
- The generated enrichment request now instructs ChatGPT to build the complete `audible_library_batch_response`, serialize it as strict JSON, encode the exact UTF-8 bytes as Base64, compute SHA-256 over those exact bytes, and return a four-line ASCII transport envelope.
- The transport envelope uses no quotation marks, so iPhone smart-quote substitution cannot corrupt JSON delimiters during the ChatGPT → Copy → Fizz Health → Paste round-trip.
- Step 2 parses the transport envelope, validates canonical Base64, decodes UTF-8, verifies SHA-256, then runs strict `JSON.parse()` on the decoded payload.
- Corrupted, incomplete, checksum-mismatched, invalid UTF-8, or malformed decoded JSON is rejected before audiobook validation or import.
- After transport verification, the existing 10-record batch count, request ID, exact ASIN/order reconciliation, duplicate-ASIN prevention, schema checks, and transactional all-or-nothing import protections remain in force.
- The UI reports successful Base64 decode and SHA-256 verification before review/import.
- The add-new audiobook exchange remains on its existing raw-JSON path; no add-new behavior was redesigned in this release.

## Explicitly out of scope

- No enrichment schema changes.
- No 10-record enrichment batch-size changes.
- No Audible library UI redesign.
- No metadata matching, runtime, cover-art, or enrichment-algorithm changes.
- No podcast/playback changes or unrelated Audio changes.

## Schema / migration

Database schema remains **147**. Audible exchange schema remains **1**. No database migration is required.

Completed story range: **FH-17130.1-FH-17130.4**
