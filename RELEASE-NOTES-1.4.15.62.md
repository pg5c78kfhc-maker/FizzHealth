# Fizz Health v1.4.15.62 — Food Delete & Serving Corrective

## Delivered

### FH-1562.1 — Restore Food deletion

- Reconnected the existing permanent Food deletion routine to Library Food swipe controls.
- Added the red Delete action alongside Add, Archive, and Category.
- Reused the established confirmation and persistence path.
- Applies to categorized, Unclassified, and imported active Foods; archived Foods retain their existing permanent-delete action.

### FH-1562.2 — Imported Food serving initialization

- Normalizes serving amount from `default_serving` or the reviewed JSON `amount`.
- Preserves the reviewed unit and serving description when supplied.
- Uses the existing application fallback only when the reviewed response omits the serving basis.

### FH-1562.3 — Existing serving-data repair

- Schema 88 repairs Foods where only one side of the serving basis exists.
- Does not fabricate a serving when both amount and unit are absent.
- Library cards now say `Not tracked in Pantry` when no Pantry record exists instead of incorrectly reporting `Servings unavailable`.

## Excluded

No automatic duplicate deletion, new deletion architecture, Library redesign, Recipe changes, Planner changes, or Shopping changes.
