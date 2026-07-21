# Fizz Health v1.4.10.25 Reconciliation

## Scope implemented

- Repaired recipe logging for both proposed and consumed destinations using schema-aware inserts.
- Repaired conversion of a proposed/planned meal into one consumed meal event.
- Preserved the original planned record by marking it consumed instead of deleting it.
- Added a stable source identity (`planned-<id>`) to guard the planned-to-consumed transaction against duplicate handling.
- Preserved proposed meal behavior: proposed entries remain in `planned_meals`, appear in the Food Log, and contribute to projected nutrition bars while remaining separate from consumed totals.
- Preserved quick-action intent for individual foods and recipes so “Add as proposed meal” cannot silently route to consumed.
- Rebuilt the New/Edit Restaurant profile editor with the standard fixed X / checkmark header, a scrollable body, and no inaccessible bottom save button.
- Synchronized release metadata to v1.4.10.25 / build 141025.

## Root causes corrected

1. Recipe insert statements had mismatched column and placeholder counts.
2. Planned-meal consumption used another hand-written insert with a mismatched value count.
3. Proposed and consumed quick actions opened the same editor without carrying the selected destination.
4. The Restaurant editor used a bottom save action that could be pushed below the iOS visual viewport.

## Data behavior

- No schema migration was required; schema remains v44.
- Proposed meals are stored with `status='planned'`.
- Consumed meals are stored in `meals`.
- Consuming a proposal changes the proposal to `status='consumed'` and records `consumed_at`.
- Nutrition snapshots remain immutable for historical meal reporting.

## Verification

- 183 automated tests passed.
- Release metadata verification passed.
- Production Vite build passed.
- Existing database schema remains v44.
