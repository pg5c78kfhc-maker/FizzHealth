# Definition of Done — Fizz Health v1.4.11.32

## FH-1328 — Promotion uniqueness
- Promoted Meals persist `source_type` and `source_id`.
- Food and Recipe promotion checks for an existing active Meal inside the same transaction.
- Repeat taps and stale promotion screens cannot create another active Meal.
- The Promote button is replaced by an “Available in Meals” status while linked.

## FH-1329 — Reliable Meal deletion
- Swipe-left Delete invokes a real persistent operation.
- Confirmation explains that history remains.
- The Meal is archived and immediately disappears from Meals and Meal Planner queries.
- The list refreshes immediately.

## FH-1330 — Eligibility restoration
- Archived Meals are ignored by the promotion check.
- Removing the last active linked Meal restores Promote to Meal on its Food or Recipe.
- Existing duplicates remain user-controlled and can be removed with the repaired Delete action.
