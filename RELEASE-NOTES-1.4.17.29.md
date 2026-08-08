# Fizz Health v1.4.17.29 — Audible iPhone Clipboard JSON Reliability

## Implemented scope

- Audible Step 2 now normalizes structural smart/curly quotation marks introduced during iPhone clipboard round-trips when they function as JSON string delimiters.
- Legitimate curly quotes and Unicode punctuation inside titles, descriptions, author text, and other audiobook metadata are preserved.
- Escaped ASCII quotes (`\"`) and backslashes remain intact.
- The normalized payload is then passed through strict `JSON.parse()`; no permissive parser or silent malformed-data acceptance was added.
- Truncated or genuinely malformed payloads remain blocked and continue to report actionable syntax/incomplete-structure diagnostics.
- Validate & review reports when clipboard formatting was corrected automatically.
- The complete enrichment batch must validate before import; no partial write is permitted.
- Existing ASIN identity, duplicate prevention, upsert behavior, 10-record enrichment batch requirements, and transactional import safety remain unchanged.

## Explicitly out of scope

- No Audible exchange schema changes.
- No enrichment batch-size changes.
- No Audible library UI redesign.
- No metadata matching or enrichment-logic changes.
- No unrelated Audio changes.

## Schema / migration

Database schema remains **147**. Audible exchange schema remains **1**. No migration is required.

Completed story range: **FH-17129.1-FH-17129.4**
