# FH-1250.3 Reconciliation — Nutrient Integrity and Decision Priority

## Implemented

- Added canonical 22-nutrient registry with canonical units and import aliases.
- Added schema 42 fields for trans fat, source, confidence, and per-nutrient completeness.
- Expanded the food nutrition editor from six fields to the complete canonical nutrient set.
- Added explicit Unknown and verified-zero handling.
- Food corrections now refresh all supported nutrient fields on matching consumed and planned snapshots.
- Expanded AI product/menu/restaurant-meal exchange contracts to request the complete nutrient set, including LDL-critical fats and cholesterol.
- Preserved the existing late-day boosts and added expected-pace/recoverability scoring.
- Changed Top 10 handling so critical nutrients are guaranteed visibility but sorted by urgency rather than pinned positions.
- Connected progress-bar color state to the same time-sensitive decision status used for ranking.
- Added ADRs, algorithm specification, nutrient data contract, pipeline documentation, traceability matrix, and release history.

## Audit finding retained for follow-up

The audit found legacy SQL write paths that were created before the canonical registry. The primary food editor, normal food logging calculation, dashboard, and AI exchange contracts now use the expanded model, but a future normalization refactor should replace every hand-written restaurant/import INSERT list with one shared snapshot writer. This release does not claim that every historical legacy import can manufacture nutrient values that were never present in its source.

## Verification

- 185 automated tests passed.
- Release metadata verification passed.
- Production build passed.
- Build warning: the main JavaScript bundle remains larger than Vite's advisory 500 kB threshold; this is not a build failure.
