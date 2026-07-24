## 1.4.11.21 — 2026-07-24

Completed FH-1302 through FH-1320.

- Replaced the static Daily Brief greeting with timestamped, continuously updated health and fitness headlines.
- Added pending-food projections, Restaurant Day context, pantry-specific nutrition guidance, and weight milestone history.
- Added smoother spoken narration and Settings → Audio with persistent voice and speed selection.
- Promoted Meal Planner to the Food subsystem tile grid and removed the redundant Plan a meal card.
- Standardized Meal Planner close navigation.
- Locked restaurant card controls to rank, price, favorite, pencil and tightened confidence percentage fitting.

## v1.4.11.20 — Restaurant Decision Dashboard Polish
- Finalized restaurant decision-card spacing and hierarchy.
- Added upper-right confidence and nutrition metric stack.
- Added standard nutrition editor save checkmark and unsaved-change guard.

# Fizz Health v1.4.11.15

## Restaurant-Aware Meal Planning Prototype

Version: 1.4.11.15  
Build: 141250  
Deployment: FH-20260723-141250  
Date: July 23, 2026

### Added

- Independent Beverage planning occasion in addition to beverages attached to meals.
- Full saved Meal catalog beneath the daily planning slots.
- Persistent date-specific Restaurant toggle synchronized through the shared daily preference used by Home.
- Automatic restaurant capacity reservation when Restaurant is enabled.
- Restaurant indicators on calendar dates.
- Starred restaurant-meal catalog when Restaurant is enabled.
- Multiple restaurant selections and restaurants on one date.

### Changed

- Removed the separate Reserve Capacity button.
- Specific restaurant selections replace provisional restaurant reservations rather than double-counting calories.

Completed story: FH-1478 through FH-1481
