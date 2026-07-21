# Fizz Health v1.4.10.23 — Release Reconciliation

## Scope implemented

- Restaurant list now uses a standard close header and a top-right add button.
- Restaurant detail now uses standard close and edit controls, eliminating navigation traps.
- The existing Restaurant Profile form is shared by Add and Edit and captures all supported lightweight restaurant fields.
- Saving a new restaurant continues directly to contextual AI Exchange for menu creation/enrichment.
- Replace Menu launches a restaurant-specific JSON exchange workspace.
- Each restaurant menu item has a pencil that launches an item-specific JSON exchange workspace.
- Generic AI capture, meal capture, and Record Visit controls were removed.
- Menu ranking cards display `?`, support swipe right for logging and swipe left for retirement, and no longer show Plan/Retire buttons.
- Menu item detail displays nutrition evidence level and confidence provenance.
- Menu item detail uses one Log Meal action leading to Consume Now or Plan for Later.
- The Food hub promotes Food and Restaurants as compact icons above remaining subsystem cards.
- No photos, PDFs, receipts, outbound JSON, or inbound JSON are persisted.

## Verification

- Automated tests: 177 passed.
- Release metadata verification: passed.
- Production build: passed.
- Database schema remains version 44; no large binary fields were added.
