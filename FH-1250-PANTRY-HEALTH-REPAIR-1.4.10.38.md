# Fizz Health v1.4.10.38 — Pantry Health Calculation Repair

## Root cause

`calculateAvailableServings()` treated `remaining_servings = NULL` as numeric zero because `Number(null)` equals `0`. Pantry inventory correctly classified records with positive `quantity` as in stock, while Pantry Health subsequently converted those same records to zero available servings and excluded them all. This produced the contradictory UI showing 54 in-stock items and “No in-stock items.”

## Repair

- Added strict numeric-presence detection that rejects null, undefined, and blank values.
- Positive pantry quantity is no longer overridden by a null `remaining_servings` field.
- Explicitly on-hand items with unknown quantity remain eligible for Pantry Health with conservative availability.
- Pantry Health now uses the same authoritative inventory state and current-location filter as the displayed inventory list.
- Pantry Health produces a numeric score whenever at least one in-stock item exists.
- Missing nutrition and freshness reduce data coverage and are reported diagnostically rather than eliminating inventory.

## Acceptance coverage

Behavioral tests verify:

1. Positive quantity with null `remaining_servings` remains in stock and contributes its true available servings.
2. Pantry Health evaluates the same in-stock records displayed by inventory.
3. Explicitly on-hand items with unknown quantities do not become false zero-stock records.
4. A numeric Pantry Health score is returned whenever an in-stock item exists.

Implementation slice: FH-1250.25.
