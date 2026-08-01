# Health Check-in Polish Audit — v1.4.15.94

## Metric cards

The full card now owns the visible border. Completed cards use the existing green completion treatment. The card body remains the edit/log target; the information icon remains a separate button and stops event propagation.

## Information presentation

The former inline `health-info-panel` is no longer rendered on the Health page. Selecting a metric information icon opens one modal-style popover above the persistent footer. It includes the same current reading, seven-day average, 30-day change, recorded range, chart, and Full History action. It dismisses through the X or by tapping the backdrop.

## Metric editors

All seven metric definitions continue to use `HealthMetricEditor`: Body Weight, Steps, Blood Pressure, Resting Heart Rate, Sleep, Waist, and Workout. The editor now uses a scrolling form container with a non-fixed header inside that container. The X cancels; the checkmark submits. Inputs are constrained to the viewport and the scrolling region reserves keyboard and safe-area space.

## Delete audit

Delete remains intentionally unchanged in data semantics:

1. It is available only when editing an existing reading with a valid `health_metrics.id`.
2. It asks for confirmation naming the metric.
3. It executes `DELETE FROM health_metrics WHERE id=?`, deleting only the selected historical reading.
4. Health trends and history are query-derived, so they recalculate on the next render after `onSaved()` refreshes the page.
5. Daily Brief and milestone content that reads Health data will reflect the revised history after refresh.
6. The current-weight setting is updated on weight save, but deletion does not independently recalculate `settings.current_weight_lb`. This is pre-existing behavior and was not changed under the approved audit-only scope.

No relocation or semantic change to Delete was made.
