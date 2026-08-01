# Fizz Health v1.4.15.97 — Health Viewport & Laboratory History

## Scope completed

- Removed the competing Health-editor viewport definitions and the Health editor from legacy generic modal sizing selectors.
- Installed one authoritative visual-viewport shell for Body Weight, Steps, Blood Pressure, Resting Heart Rate, Sleep, Waist, and Workout editors.
- Restored an internal touch-scroll region with `touch-action: pan-y`; removed the Health-path `touch-action: none` behavior.
- Connected the Labs detail page to stored `lab_results` and biomarker health records.
- Added newest-first folder-style year tabs and draw-date tabs for years containing more than one panel.
- Added aligned laboratory labels and values, trend comparisons, units, incomplete-panel handling, and range-aware value pills.
- In-range values use black text on green; out-of-range values use white text on red; records without a usable range use a neutral gray treatment.

## Data handling

Missing tests are omitted from partial panels and are never converted to zero. Stored reference limits take precedence. Where the database has no limits, the page uses the application’s existing configured targets for supported biomarkers and displays “Range not stored” for unsupported biomarkers.
