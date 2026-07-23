# Fizz Health v1.4.11.15

## Restaurant-Aware Meal Planning Prototype

Version: 1.4.11.15  
Build: 141250  
Deployment: FH-20260723-141250  
Date: July 23, 2026

### Completed

- FH-1478 — Added an independent Beverage occasion above Snack while preserving beverages as optional components of Breakfast, Lunch, and Dinner.
- FH-1479 — Added the complete saved-Meal catalog below the planning slots.
- FH-1480 — Added a persistent, date-specific Restaurant Day toggle synchronized through the same daily preference used by Home.
- FH-1481 — Restaurant Day now creates calorie capacity automatically, supports multiple restaurant occasions, and removes the separate reserve-capacity action.
- FH-1482 — Added starred restaurant favorites to the planner and allowed specific restaurant meals to replace available capacity reservations.

### Prototype behavior

A date can contain multiple restaurant occasions, including meals from different restaurants. Unknown restaurant plans begin as calorie reservations; saved restaurant selections replace available estimated capacity as plans become more specific.

Completed story: FH-1478 through FH-1482
