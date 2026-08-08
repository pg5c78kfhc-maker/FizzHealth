# Fizz Health v1.4.17.28 — Audible Enrichment 10-Record Batches

## Implemented scope

- Existing-audiobook enrichment requests now include at most 10 incomplete records instead of 50.
- `enrich_existing` requests emit `batch_size: 10` and machine-readable `expected_record_count` equal to the actual submitted batch count.
- Full enrichment batches therefore require exactly 10 response records; the final partial batch requires exactly the number actually submitted.
- Audible exchange UI now labels the action `Enrich 10 incomplete` and reports the current selection from a maximum of 10 records.
- New-book (`add_new`) exchange batches remain at 50 records.
- Strict JSON syntax requirements, JSON.parse()-first validation, exact ASIN/order reconciliation, duplicate rejection, transaction safety, existing metadata preservation, and cover caching remain unchanged.

## Schema / migration

Database schema remains **147**. Audible exchange schema remains **1**. No migration is required.

## Acceptance targets

- An enrichment request with at least 10 incomplete books contains exactly 10 `existing_records` and `batch_size` 10.
- A partial enrichment request with fewer than 10 incomplete books uses the actual count for response completeness validation.
- The add-new request continues to use `batch_size` 50.
- Existing strict JSON and ASIN reconciliation behavior remains intact.

Completed story range: **FH-17128.1-FH-17128.4**
