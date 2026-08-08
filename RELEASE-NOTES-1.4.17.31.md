# Fizz Health v1.4.17.31 — Audible Universal Exchange & Targeted Enrichment

## Implemented scope

- Replaced request-state-dependent Audible response importing with one universal response pipeline. The importer determines the transaction type from the incoming payload rather than from the currently selected request button.
- Valid supported responses remain importable after navigation, app restart, or creation of later outbound requests. `request_id` is retained as provenance/audit metadata but is no longer required to match an in-memory active request.
- Add-new, full enrichment, and targeted enrichment requests now all require the proven `FIZZ_HEALTH_AUDIBLE_ENCODED_RESPONSE_V1` transport: Base64 UTF-8 payload plus SHA-256 verification before strict JSON parsing.
- Backward-compatible strict raw JSON responses remain accepted where safe, so previously generated supported responses are not unnecessarily stranded.
- Existing audiobook identity is resolved deterministically using Fizz `audiobook_id`/`fizz_record_id` when supplied and Audible ASIN. Conflicting identifiers are rejected before any writes.
- Existing-ASIN enrichment updates existing records and cannot create a new audiobook. New audiobook creation remains authorized only by `add_new` transactions.
- Added generic targeted-enrichment metadata (`target_fields`, self-contained expected count, requested ASIN list, patch semantics) so future field-specific jobs can reuse the same exchange architecture.
- Added the first targeted operation: cover-art-only enrichment for up to 50 existing audiobooks missing usable artwork.
- Cover-only outbound requests contain compact identity data rather than full descriptions/runtime metadata.
- Cover-only responses may update only `cover_image_url`/cover source metadata. Omitted or null cover values are no-ops and cannot clear existing metadata.
- Full enrichment remains capped at 10 records. Cover-only targeted enrichment is capped at 50 records. Add-new remains capped at 50 records.
- Import remains transactional and all-or-nothing. Transport, checksum, decoded JSON, schema, batch count, ASIN uniqueness/order (when self-described), identity resolution, and patch-field validation all complete before database writes.
- The review UI now reports the transaction type and, for cover-only jobs, the number of supplied cover patches versus unchanged records.

## Explicitly out of scope

- No Audible playback changes.
- No unrelated Audible library redesign.
- No podcast, workout, nutrition, health, or other unrelated Fizz Health changes.
- No database schema migration.
- No change to full-enrichment batch size beyond the existing 10-record maximum.

## Schema / migration

Database schema remains **147**. Audible exchange schema remains **1**. No migration is required.

Completed story range: **FH-17131.1-FH-17131.5**
