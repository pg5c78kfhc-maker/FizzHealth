# Fizz Health v1.4.15.82

## Inventory Calculation Consolidation

This release replaces competing inventory calculations with one authoritative service in `src/inventory/service.js`.

### Changes
- Centralized available-quantity, sufficiency, and deduction calculations.
- Redirected Library counts, recipe availability, prepared-batch validation, Pantry deductions, Menu counts, and shared availability indexing to the same service.
- Preserved `src/inventory/quantity.js` only as a compatibility re-export; it no longer contains inventory math.
- Corrected legacy Pantry records that have `package_count` but no `package_type` so they are still interpreted as container inventory.
- Preserved legacy measured-package support, including open contents plus sealed containers.
- Corrected Blueberries with one 100 g serving to report one serving available.
- Corrected Red Onion so one onion resolves through its 150 g Food serving definition and deducts exactly one onion.

### No unrelated changes
- No UI redesign.
- No wording changes.
- No database schema changes.
- No barcode, enrichment, or navigation changes.
