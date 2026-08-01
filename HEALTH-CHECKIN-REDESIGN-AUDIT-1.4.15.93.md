# Health Check-in Redesign Audit — v1.4.15.93

## Metric order

1. Body Weight
2. Steps
3. Blood Pressure
4. Resting Heart Rate
5. Sleep
6. Waist
7. Workout

## Interaction contract

Each metric is rendered as a card container with two independent controls:

- **Main card control:** opens the existing `HealthMetricEditor` with the metric definition and today's reading.
- **Information control:** changes only the selected information metric and does not open the editor.

The completion check or plus indicator remains visual and reflects whether today's reading exists.

## Context-sensitive information panel

The former repeated History link list was removed. One shared panel now derives its content from the selected information metric and displays:

- latest value and timestamp;
- seven-day average where applicable;
- 30-day change where applicable;
- recorded low-to-high range;
- total reading count;
- recent trend chart;
- link to the existing full history screen.

No historical records or existing full-history functionality were removed.

## Layout

The metric grid stays two columns wide on compact iPhone widths. Icons are enlarged and centered, values remain visible on the card, and information controls occupy a distinct right-side tap area.

## Preserved behavior

- Health metric creation, editing, and deletion
- Weight setting synchronization
- Required-check-in progress
- Optional metric treatment
- Full metric history and range filters
- Health and meal timeline
