# Fizz Health v1.4.10.36

## Critical repair

- Repairs recipe consumption so complete nutrient snapshots, including caffeine, are saved and the dashboard refreshes immediately.
- Converts compatible ingredient units before recipe nutrient aggregation.
- Prevents oversized recipe ingredient payloads from destabilizing meal logging.
- Repairs AI enrichment approval by serializing structured values before SQLite binding.
- Keeps success and exact failure feedback visible beside the review header.
- Preserves all-or-nothing enrichment transactions and readable evidence details.

Implementation slice: FH-1250.25.
