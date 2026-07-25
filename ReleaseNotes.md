# Fizz Health v1.4.12.1 — Nutrition Landing Page Organization

Issued July 25, 2026 · Build 141201 · Deployment FH-20260725-141201

## Completed

- **FH-1412.1** — Renamed the Eat subsystem and primary navigation destination to **Nutrition**.
- **FH-1412.2** — Reorganized the landing page into bordered **Eating** and **Manage** cards with equal-size action buttons.
- **FH-1412.3** — Preserved the existing destinations for Meals, Pantry, Restaurants, Shopping, Meal Planner, and Chef’s Recommendations.
- **FH-1412.4** — Moved **Log Once** out of the Meals create menu and added it as a Nutrition landing-page action using the existing one-time logging workflow.
- **FH-1412.5** — Removed the page-level plus button from the Nutrition landing page.
- **FH-1412.6** — Removed the obsolete Upcoming Meals landing card, route, page component, and supporting navigation entry.
- **FH-1412.7** — Removed the redundant Recommendations landing card and exposed the existing destination as **The Chef**.
- **FH-1412.8** — Added regression coverage for the new hierarchy, preserved routing, Log Once relocation, and retired UI.

## Scope boundaries

The forms opened by Meals, Pantry, Restaurants, Shopping, Menu, and The Chef were not redesigned in this slice. Their existing routing and functionality remain authoritative.

## Known issues

None recorded.
