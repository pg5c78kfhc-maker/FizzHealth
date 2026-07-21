# Fizz Health v1.4.10.22 — Corrective Release Reconciliation

## Implemented scope

1. The global floating `+` now opens **Add Food** directly.
2. Legacy **Universal Capture** UI, routes, restaurant cards, and component code were removed from the application.
3. **+ New Food** and **⚡ Log Once** are both rendered with white icons and labels for reliable dark-mode contrast.
4. AI Exchange Step 2 now provides an explicit **Paste Response** control for both new/one-time workflows and existing-food enrichment.
5. Restaurant detail loading was hardened:
   - corrected restaurant learning-event ordering to use `occurred_at`;
   - converted optional restaurant history/template/event reads to safe queries;
   - isolated restaurant capture and history modules with local error boundaries;
   - removed the obsolete Universal Capture restaurant card.

## Data behavior

- Database schema remains version 44.
- No user data migration is required.
- Historical meal snapshots remain unchanged.
- Photos and exchange JSON are not retained by the unified food workflow.

## Verification

- 171 automated tests passed.
- Release metadata verification passed.
- Production Vite build completed successfully.

## Test maintenance

Thirteen legacy test files whose assertions required the now-removed Universal Capture implementation or prior release identity were moved to `tests/legacy-retired/`. A focused v1.4.10.22 regression suite was added for the replacement Universal Add navigation, action contrast, explicit clipboard control, and restaurant detail resilience.
