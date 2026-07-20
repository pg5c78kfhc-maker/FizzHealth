# ADR-005 — Same-day nutrition propagation

## Decision
A correction to a master food record automatically recalculates every matching planned meal and consumed meal dated today. Records before today retain their original nutrition snapshots.

## Rationale
Today is still an active working period. A user normally edits nutrition because a current value is known to be wrong. Preserving an incorrect current-day dashboard would violate the nutrition-trust objective. Historical records may reflect different products, recipes, or evidence and therefore are not rewritten automatically.

## Required behavior
- Scale every canonical nutrient using the saved serving basis and logged amount.
- Preserve null as Unknown and zero only as an explicit verified zero.
- Refresh dashboard totals, contributors, and projections after save.
- Do not update prior-day consumed records without an explicit historical-correction workflow.

## Related work
FH-1250.10, FH-1250.11, FH-1250.12.
