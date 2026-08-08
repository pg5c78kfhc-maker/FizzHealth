# Fizz Health v1.4.17.17 — Compact Workout Exchange & Workout-Aware Maintenance

## Scope
This focused release compacts the workout calorie-estimate exchange controls and feeds recorded workout calorie estimates into maintenance/set-point intelligence without double-counting activity already represented by body-weight trend.

- Replaces the large full-width workout Export/Import control with a compact circular icon in the workout action row beside Edit.
- Export uses an upload/export icon; after JSON is exported, the same position switches to an import/download icon.
- Existing eligibility and state rules remain unchanged: exchange actions only appear for completed or early-ended workout executions and imported estimates remain tied to the correct execution.
- The action footprint is reserved only on the workout title row. Completion time, duration, copied-from metadata, estimated calories, and other information below retain the available horizontal width.
- Maintenance intelligence now reads estimated calories from completed and early-ended workout executions.
- Workout calories are treated as lower-confidence activity context: they separate recorded training load from background expenditure and can improve confidence when present, but are not simply added to the maintenance estimate because the observed weight trend already reflects that expenditure.
- Maintenance decision traces now disclose workout-estimate coverage, average recorded workout calories, and the activity-separated background-maintenance component.
- No database changes. Schema remains 146.

Completed story range: FH-17117.1-FH-17117.4

## Stories
- FH-17117.1 — Compact stateful Export/Import workout action icon
- FH-17117.2 — Preserve full-width workout metadata below the action row
- FH-17117.3 — Incorporate workout calorie estimates into maintenance intelligence without double counting
- FH-17117.4 — Expose workout activity context in maintenance decision traces
