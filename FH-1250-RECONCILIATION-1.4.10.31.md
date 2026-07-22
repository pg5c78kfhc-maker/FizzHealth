# Fizz Health v1.4.10.31 Reconciliation

## Scope
FH-1250.25 corrective implementation.

## Corrected behavior
- Pantry quantity is now the authoritative inventory state.
- Quantity greater than zero is In Stock even when stale `on_hand`, `status`, or freshness fields disagree.
- Quantity equal to zero is Out of Stock.
- Archived, deleted, and discarded records remain excluded from active inventory.
- Pantry Health, Eat Next, Waste Risk, Restock, and Out of Stock now consume the same inventory state.
- Expired food remains in stock and is surfaced through Waste Risk instead of being misclassified as Out of Stock.

## Verification
- 198 automated tests passed.
- Release metadata verification passed.
- Production build was attempted but could not run because Vite is not installed in this execution environment.
