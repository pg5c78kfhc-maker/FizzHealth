# Fizz Health v1.4.17.28 — Audible Enrichment 10-Record Batches

## Implemented scope

- Reduced only the `enrich_existing` Audible JSON exchange from up to 50 incomplete audiobook records to up to 10 records per request so the request/response clipboard payload remains practical on iPhone.
- Enrichment requests now emit `batch_size: 10`; full 10-record requests require exactly 10 returned records, while a final partial batch requires exactly the actual submitted count.
- Updated the Audible exchange UI to say “Enrich 10 incomplete” and to select no more than 10 incomplete existing books for each enrichment request.
- Kept the `add_new` workflow at 50 records.
- Preserved the strict well-formed JSON contract, parser-first validation, exact ASIN/order reconciliation, duplicate rejection, transaction rollback, metadata preservation, and dynamic cover-cache behavior from v1.4.17.27.

## Schema / migration

Database schema remains **147**. Audible exchange schema remains **1**. No database migration is required.

## Scope exclusions

- No reduction of new-book 50-record batches.
- No patch/delta exchange redesign.
- No changes to Audible ownership, listening-state, cover validation, or runtime semantics.
- No Podcast, Workout, Nutrition, Health, or unrelated changes.

Completed story range: **FH-17128.1-FH-17128.4**

---

# Fizz Health v1.4.17.27 — Audible JSON Exchange Strict-Validity Reliability

## Implemented scope

- Strengthened every generated Audible JSON exchange request with parser-grade output requirements at the top of the instruction list: exactly one JSON object, no Markdown/commentary/code fences, ASCII JSON delimiters, correct escaping, no trailing commas/comments/non-JSON values, no truncation, and an explicit final `JSON.parse()` validity check before response.
- Added machine-readable `response_requirements` to every Audible request, including strict JSON, parser compatibility, expected record count, ASIN identity, preserved input order, and unique-ASIN requirements.
- Retained the full 50-record workflow. This release does not reduce batch size as a workaround for malformed model output.
- Enrichment requests now require every submitted existing record to be returned exactly once and in the same ASIN order. A 50-record enrichment request therefore requires 50 response records even when some records receive no new metadata.
- Reworked Audible response intake to be syntax-first. Only harmless BOM/outer whitespace is normalized; Fizz Health no longer strips code fences, extracts embedded objects, or replaces typographic punctuation in an attempt to repair malformed Audible JSON.
- Added actionable parse diagnostics including parser error text, character/line/column when the runtime exposes an offset, nearby problem text, and likely truncation/unclosed-string/object/array hints.
- Schema validation now occurs only after strict JSON parsing succeeds and can enforce request ID, mode, exact expected record count, duplicate rejection, and exact enrichment ASIN/order reconciliation before an import can be previewed.
- Existing transactional import, ASIN reconciliation, non-null metadata preservation, finished-state preservation, and dynamic cover-cache behavior remain unchanged.

## Schema / migration

Database schema remains **147**. The Audible exchange schema remains **1**. No database structural migration is required.

## Scope exclusions

- No reduction of the 50-record Audible batch size.
- No patch/delta exchange redesign.
- No audiobook source seed changes or ownership-count changes.
- No podcast, Workout, Nutrition, Health, or unrelated UI/data changes.

## Acceptance targets

- A correctly escaped 50-record response parses and validates as a complete batch.
- Commentary or Markdown fences around otherwise valid JSON are rejected instead of silently stripped.
- Malformed embedded quotes, missing closing delimiters, and truncated responses fail before schema validation or database writes and display actionable diagnostics.
- Enrichment responses with missing, duplicated, extra, or reordered submitted ASINs are rejected before import.
- Zero database changes occur when JSON syntax or batch reconciliation fails.

Completed story range: **FH-17127.1-FH-17127.5**
