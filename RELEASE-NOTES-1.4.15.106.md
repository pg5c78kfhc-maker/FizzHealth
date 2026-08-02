# Fizz Health v1.4.15.106 — Canonical Recipe & Transaction Consistency

Baseline: `Fizz-Health-v1.4.15.105-FULL-SOURCE.zip`

## Implemented

- Proposed recipe rows now resolve their current recipe name, serving basis, nutrition, and ingredient composition from the canonical recipe record while they remain unconsumed.
- Legacy Proposed rows that still identify recipes as `meal` or through `recipe:*` identifiers are normalized to `source_type = recipe` and canonical recipe IDs.
- Recipe consumption no longer trusts stale `meal_components` when the meal definition represents a recipe; it redirects to the current `recipes` composition.
- Pantry consumption now preflights every tracked ingredient before making deductions. An incompatible or insufficient ingredient aborts the containing database transaction before any deductions are committed.
- Inventory errors now identify the requested amount/unit and stored inventory unit and explicitly state that no changes were saved.
- Existing v1.4.15.105 restaurant propagation, independent meal duplication, footer-safe Nutrition workflows, and barcode `+1` behavior are preserved.
- Release, About, database, decision-engine, service-worker, package, and release-history metadata were advanced to v1.4.15.106.

## Historical policy

Consumed meals remain historical snapshots. Only active Proposed recipe rows are resolved dynamically from the current recipe definition.
