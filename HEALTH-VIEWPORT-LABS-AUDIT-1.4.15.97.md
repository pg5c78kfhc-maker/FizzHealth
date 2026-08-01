# Health Viewport & Labs Audit — v1.4.15.97

## Health editor root cause and correction

The v1.4.15.96 source still contained multiple active definitions for the Health backdrop, form, and scroll container. It also left Health editors inside generic modal selectors, retained large keyboard padding, and applied `touch-action: none` to the page while a Health editor was open.

v1.4.15.97 removes those competing declarations instead of adding another override. The final stylesheet contains exactly one definition each for:

- `.health-editor-backdrop`
- `.health-editor-backdrop > .health-editor`
- `.health-editor-scroll`

The Health editor is also removed from legacy comma-separated generic modal sizing selectors.

The final runtime layout is:

1. A fixed backdrop sized once from `--visual-viewport-height` and `--visual-viewport-top`.
2. A form positioned exactly inside that shell without a second maximum-height calculation.
3. One internal scrolling element spanning the shell.
4. `touch-action: pan-y` on the scroller and no Health-path `touch-action: none`.
5. Focus scroll margins of 12 px above and 112 px below, replacing fixed 220–260 px padding.

## Labs data source

The Labs page consumes the same merged runtime collection used by the Labs card and popover:

- `lab_results`
- `health_metrics` rows whose `metric_type` begins with `biomarker:`

Rows are normalized and deduplicated by biomarker, collection date, and numeric value.

## Labs navigation and presentation

- Years are derived from actual stored collection dates and shown newest first.
- The newest draw in the selected year is the default.
- A draw-date selector appears only when the selected year contains multiple dates.
- The page displays only tests present for the active draw.
- Labels are left aligned; value pills and units are right aligned.
- Prior-result direction is calculated per biomarker when an earlier result exists.

## Range evaluation

Stored `reference_low` and `reference_high` values take precedence. Where they are absent, existing application targets are used for supported markers: total cholesterol, non-HDL, LDL, HDL, triglycerides, A1C, ApoB, fasting glucose, and PSA.

- In range: green background, black text.
- Out of range: red background, white text.
- No usable range: gray background, white text.

No missing result is treated as zero. Unsupported or incomplete records display without an invented range.

## Timeline deletion finding

The current swipe timeline exposes Delete only for meal events. Health metric events do not currently receive a swipe-delete action. Delete remains absent from Health input forms as approved. Adding a metric timeline deletion workflow remains outside this release.
