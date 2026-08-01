# Health Page Audit — v1.4.15.95

## Header

The previous duplicated `HEALTH / Health` form-style header and oversized `Morning check-in` introduction were replaced by one centered **Health** landing title using the Nutrition/Library landing structure. The close control remains at the left and the header divider is retained.

## Daily Health area

The completion count and progress bar remain authoritative. They are now contained in a compact Daily Health card rather than occupying a large introductory block.

## Metric grid

The visible order is:

1. Body Weight
2. Steps
3. Blood Pressure
4. Resting Heart Rate
5. Sleep
6. Waist
7. Workout
8. Labs

The Labs card summarizes the number of distinct biomarkers and latest draw date. Its information control opens the same popover system used by the other metrics.

## Laboratory data exposed

The popover reads the existing `lab_results` records and `health_metrics` rows whose metric type begins with `biomarker:`. It de-duplicates equivalent biomarker/date/value records and exposes:

- latest draw date;
- total stored results;
- distinct biomarkers;
- number of draw dates represented;
- latest values requiring attention under the currently configured LDL, A1C, glucose, and triglyceride thresholds;
- up to six recent biomarker values.

No new laboratory schema or biomarker calculation engine was introduced.

## Health metric editors

All seven editors now bind their maximum height to the live `window.visualViewport` height and listen for resize and scroll changes caused by the iOS keyboard. The form remains internally scrollable with expanded keyboard-safe bottom padding. The header remains attached to the top of the scrollable form.

The Delete action was removed from these forms. The standard X and checkmark remain the only form actions.

## Timeline delete verification

The unified Health and meal timeline currently routes deletion for meal events through its swipe action. Health metric events remain editable by tapping them, but the current shared timeline component does not expose a metric-delete callback. This release does not add another deletion path because the approved scope required verification rather than an unreviewed destructive workflow. A dedicated metric timeline deletion story should define confirmation, weight-setting recalculation, trend refresh, and Undo behavior before implementation.
