# Fizz Health v1.4.10.31 Reconciliation

## Baseline

- Source baseline: v1.4.10.26
- Implementation slice: FH-1250.25
- Release type: Corrective implementation release

## Implemented

- Recipe favorites and recent-use parity.
- Unified pantry inventory classification across Pantry Health, Eat Next, Waste Risk, Restock, Out of Stock, and Shopping.
- Expiration/freshness separated from stock availability.
- Default pantry location changed to All.
- Out-of-stock items removed from the main in-stock list and exposed through a dedicated filter.
- Pantry item detail and editable inventory reconciliation.
- Missing confidence and unavailable health-score states no longer render as misleading 0% values.
- Keyboard-safe Add Pantry editor with X / title / checkmark header.
- Compact header add actions for Food and Pantry; oversized Food tile plus replaced with a food icon.

## Verification

See TEST-PROOF-1.4.10.31.txt for exact commands and results.
