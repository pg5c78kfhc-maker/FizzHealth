# Fizz Health v1.4.15.105 — Workflow Stability & Inventory Quick Add

Baseline: `Fizz-Health-v1.4.15.104-FULL-SOURCE.zip`

## Completed

- Restaurant names now resolve from the canonical `restaurants` record in the Menu and restaurant-aware recommendations.
- Restaurant profile renames propagate to active restaurant menu rows and future Proposed meals; migration 104 repairs existing stale names.
- Food Log “Log again” creates a new independent source identity instead of reusing the original `(source, source_record_id)` pair.
- Duplicate failures now show a user-friendly message rather than raw SQLite constraint text.
- Copy Proposed Meals and barcode-resolution workflows are constrained above the persistent bottom navigation and iPhone safe area with bounded scrolling.
- Known-barcode Food details now show a `+1` header action before the pencil. It adds one count-based container through a normal inventory event and refreshes the displayed total. Weight-based inventory routes to the Inventory editor.
- Release, schema, decision-engine, service-worker, and About metadata were advanced to v1.4.15.105.

## Out of scope

No nutrition scoring changes, laboratory changes, recipe redesign, meal planner redesign, or new data imports.
