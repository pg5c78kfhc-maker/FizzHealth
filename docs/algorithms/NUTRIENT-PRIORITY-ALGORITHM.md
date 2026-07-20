# Nutrient Priority and Color Algorithm

## Inputs
Consumed value, planned value, target, maximum, behavior type, base health priority, and local hour.

## Goal nutrients
Expected pace is the elapsed share of the active day (6 AM–10 PM). Priority increases with target gap, pace deficit, and declining recoverability. Late-day and evening boosts from the prior engine are retained.

Status/color:
- Green: target met or intake is on pace.
- Amber: behind pace but still recoverable.
- Red: materially behind pace late enough that recovery is difficult.

## Limit nutrients
Priority increases as projected intake approaches the configured limit. Exceeded is red; 80% or greater is amber; below caution is green.

## Visibility
Rank every nutrient by urgency. Select the ten highest, then guarantee the six critical nutrients by replacing the least urgent noncritical entries. Re-sort the selected ten by urgency. Guaranteed visibility never implies a fixed rank.

## Explainability
The detail view reports the same priority score and inputs used to rank the bar.
