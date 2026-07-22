# Fizz Health v1.4.10.40c

**Type:** Critical corrective release  
**Build:** 141040C  
**Release ID:** FH-20260722-141040C  
**Issued:** July 22, 2026

## FH-40C-1 — Pantry enrichment paste recovery

- Corrected the Pantry Food Enrichment review transition that referenced nonexistent `currentFood` state after a valid clipboard response was parsed.
- Valid enriched JSON now remains in the mounted workflow and opens the review screen instead of crashing to a black page.
- The same selected `food` target is used consistently during review, approval, meal recalculation, and persistence.
- Invalid, mismatched, or unreadable clipboard JSON remains on the exchange screen with a visible validation message.
- Added regression coverage for the exact paste-to-review crash and metadata consistency.

## Artifacts

- Full source: `Source.1.4.10.40c.zip`
- Changed files: `Changed.1.4.10.40c.zip`
