# Health Editor & Labs Audit — v1.4.15.100

## Health editor
Project-wide review confirmed one active component: `HealthMetricEditor` in `src/main.jsx`.

Removed from the active implementation:
- `health-metric-modal-new`
- `health-metric-form-new`
- `health-metric-form-scroll`
- React `viewport.top` / `viewport.height` geometry
- manual focus-reveal scroll calculations

Replacement structure:
- `.health-editor`
- `.health-editor-shell`
- `.health-editor-header`
- `.health-editor-scroll`
- `.health-editor-fields`

The shell is a full-screen flex column. The header is fixed within the shell and the body is the only bounded scrolling region. Visual Viewport events update CSS variables rather than rebuilding editor geometry in React.

## Metric coverage
The shared editor serves Body Weight, Steps, Blood Pressure, Resting Heart Rate, Sleep, Waist, and Workout. Blood Pressure has separate systolic and diastolic inputs.

## Deletion
The editor contains no Delete action. Health metric deletion is available from timeline swipe actions and supports Undo by restoring the original database record.

## Labs layout
Every Labs row uses two columns:
1. Biomarker name and previous-result trend.
2. One fixed, right-aligned result card containing result, unit, and stored reference range.

Status treatment:
- In range: green card / black text.
- Out of range: red card / white text.
- Missing result/range, including Not reported: gray card / dark text.

Legacy `.labs-value-reading` and `.lab-value-pill` markup is no longer active.
