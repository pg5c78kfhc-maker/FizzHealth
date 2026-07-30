# Fizz Health v1.4.15.54 — Shopping Eligibility and Food-Link Integrity

Build: 141554  
Deployment: FH-20260730-141554

## Delivered

- **FH-1554.1:** Shopping now automatically includes only non-discontinued Pantry records whose quantity is zero or less. Legacy `Order Soon`, `Restock`, `Low`, and `High` text values no longer qualify an item.
- **FH-1554.2:** Every visible Shopping item must resolve to an active Food record. Shopping cards open that exact standard Food Information record.
- **FH-1554.3:** Invalid Pantry food links are repaired only when one unique exact-name Food match exists. Unresolved orphaned Pantry records are excluded and recorded in the local `fizz-shopping-link-audit` diagnostic instead of being guessed or duplicated.

## Boundaries

- No database schema changes.
- No reorder thresholds.
- No changes to inventory depletion logic.
- No unrelated Library or Shopping presentation changes.
